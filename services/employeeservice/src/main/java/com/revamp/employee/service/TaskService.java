package com.revamp.employee.service;

import com.revamp.employee.dto.CreateTaskRequest;
import com.revamp.employee.dto.TaskActionRequest;
import com.revamp.employee.model.Task;
import com.revamp.employee.model.TaskUpdate;
import com.revamp.employee.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BookingServiceClient bookingServiceClient;

    @Autowired
    private EmployeeService employeeService;

    /**
     * Create a new task assigned to an employee by an admin.
     * 
     * @param request The task creation request containing all task details
     * @return The created task
     */
    public Task createTask(CreateTaskRequest request) {
        Task task = new Task();
        task.setCustomerId(request.getCustomerId());
        task.setCustomerName(request.getCustomerName());
        task.setVehicleInfo(request.getVehicleInfo());
        task.setServiceType(request.getServiceType() != null ? request.getServiceType().toLowerCase() : "service");
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority().toLowerCase() : "medium");
        task.setEstimatedHours(request.getEstimatedHours());
        task.setAssignedDate(request.getAssignedDate() != null ? request.getAssignedDate() : LocalDateTime.now());
        task.setDueDate(request.getDueDate());
        task.setAssignedEmployeeId(request.getAssignedEmployeeId());
        task.setAssignedAdminId(request.getAssignedAdminId());
        task.setInstructions(request.getInstructions());
        task.setStatus("assigned"); // New tasks start as "assigned"
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        task.setUpdates(new ArrayList<>());
        
        Task savedTask = taskRepository.save(task);
        
        // Create notification for employee when task is assigned
        if (savedTask.getAssignedEmployeeId() != null && !savedTask.getAssignedEmployeeId().isEmpty()) {
            try {
                String adminId = savedTask.getAssignedAdminId() != null ? savedTask.getAssignedAdminId() : "ADMIN001";
                notificationService.sendEmployeeNotification(
                    savedTask.getAssignedEmployeeId(),
                    adminId,
                    "info",
                    "New Task Assigned",
                    "You have been assigned a new task: " + savedTask.getCustomerName() + "'s " + savedTask.getServiceType(),
                    savedTask.getId(),
                    null
                );
                System.out.println("✓ Notification created for employee: " + savedTask.getAssignedEmployeeId());
            } catch (Exception e) {
                System.err.println("✗ Failed to create notification for employee: " + e.getMessage());
                // Don't fail task creation if notification fails
            }
        }
        
        return savedTask;
    }

    /**
     * Get all tasks assigned to an employee.
     * 
     * IMPORTANT: Tasks only appear here if they have been assigned by an admin.
     * - Admin creates task and sets assignedEmployeeId to the employee's ID
     * - Only tasks with assignedEmployeeId matching the employeeId are returned
     * - Tasks without assignment (assignedEmployeeId is null) will NOT appear
     * 
     * @param employeeId The employee ID to fetch tasks for
     * @return List of tasks assigned to this employee (only tasks assigned by admin)
     */
    public List<Task> getEmployeeTasks(String employeeId) {
        // Only return tasks that are assigned to this employee by admin
        // Tasks must have assignedEmployeeId set (assigned by admin)
        // Filter out any tasks that don't have a valid assignment
        // IMPORTANT: Tasks with assignedEmployeeId = null (rejected tasks) will NOT be returned
        List<Task> tasks = taskRepository.findByAssignedEmployeeId(employeeId);
        // Additional validation: ensure tasks have valid status and are properly assigned
        // Also filter out rejected tasks (status = "assigned" with null assignedEmployeeId)
        return tasks.stream()
            .filter(task -> task.getAssignedEmployeeId() != null 
                && task.getAssignedEmployeeId().equals(employeeId)
                && task.getStatus() != null
                && !task.getStatus().isEmpty()
                && !(task.getStatus().equals("assigned") && task.getAssignedEmployeeId() == null)) // Extra safety check
            )
            .toList();
    }

    public List<Task> getEmployeeTasksByStatus(String employeeId, String status) {
        return taskRepository.findByAssignedEmployeeIdAndStatus(employeeId, status);
    }

    public Optional<Task> getTaskById(String taskId, String employeeId) {
        return taskRepository.findByIdAndAssignedEmployeeId(taskId, employeeId);
    }

    public Task acceptTask(String taskId, TaskActionRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus("accepted");
            task.setUpdatedAt(LocalDateTime.now());
            
            // Add task update
            TaskUpdate update = new TaskUpdate("accepted", "Task accepted by employee", LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found");
    }

    public Task rejectTask(String taskId, TaskActionRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            String rejectedEmployeeId = task.getAssignedEmployeeId(); // Store before clearing
            String previousStatus = task.getStatus(); // Store for logging
            
            // Reset task to "assigned" state and clear employee assignment for reassignment
            // This makes the task available for admin to reassign to another employee
            task.setStatus("assigned"); // Reset to "assigned" status for admin reassignment
            task.setAssignedEmployeeId(null); // Clear employee assignment - task is now available for reassignment
            task.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("=== Task Rejection ===");
            System.out.println("Task ID: " + taskId);
            System.out.println("Previous Status: " + previousStatus);
            System.out.println("New Status: " + task.getStatus() + " (reset for reassignment)");
            System.out.println("Previous Employee: " + rejectedEmployeeId);
            System.out.println("New Employee: null (cleared for reassignment)");
            System.out.println("Customer: " + task.getCustomerName());
            System.out.println("Service Type: " + task.getServiceType());
            
            // Add task update
            String rejectionNote = request.getNotes() != null && !request.getNotes().isEmpty() 
                ? request.getNotes() 
                : "No reason provided";
            TaskUpdate update = new TaskUpdate("rejected", "Task rejected by employee: " + rejectionNote, LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            // Send notification to admin (use admin ID from task, or skip if not available)
            if (task.getAssignedAdminId() != null && !task.getAssignedAdminId().isEmpty()) {
                try {
                    notificationService.sendAdminNotification(
                        task.getAssignedAdminId(),
                        rejectedEmployeeId != null ? rejectedEmployeeId : request.getEmployeeId(),
                        "warning",
                        "Task Rejected - Reassignment Required",
                        task.getCustomerName() + "'s " + task.getServiceType() + " has been rejected by employee. Task reset to 'assigned' status. Please reassign to another employee.",
                        taskId,
                        null
                    );
                    System.out.println("✓ Notification sent to admin: " + task.getAssignedAdminId() + " - Task needs reassignment");
                } catch (Exception e) {
                    System.err.println("✗ Failed to send notification to admin: " + e.getMessage());
                }
            }
            
            Task savedTask = taskRepository.save(task);
            System.out.println("✓ Task saved successfully:");
            System.out.println("  - Status: " + savedTask.getStatus() + " (ready for reassignment)");
            System.out.println("  - Assigned Employee ID: " + (savedTask.getAssignedEmployeeId() != null ? savedTask.getAssignedEmployeeId() : "null (cleared)"));
            System.out.println("  - Admin can now reassign this task to another employee");
            
            // Update appointment in booking service to remove employee assignment
            if (savedTask.getCustomerId() != null && rejectedEmployeeId != null) {
                try {
                    // Get employee name from employee service
                    String employeeName = "";
                    try {
                        var employeeOpt = employeeService.getEmployeeByEmployeeId(rejectedEmployeeId);
                        if (employeeOpt.isPresent()) {
                            employeeName = employeeOpt.get().getUsername() != null ? employeeOpt.get().getUsername() : "";
                        }
                    } catch (Exception e) {
                        System.err.println("Could not fetch employee name: " + e.getMessage());
                    }
                    
                    boolean success = bookingServiceClient.removeEmployeeFromAppointment(
                        savedTask.getCustomerId(),
                        rejectedEmployeeId,
                        employeeName
                    );
                    
                    if (success) {
                        System.out.println("✓ Appointment updated in booking service - employee removed");
                    } else {
                        System.err.println("✗ Failed to update appointment in booking service");
                    }
                } catch (Exception e) {
                    System.err.println("✗ Error updating appointment in booking service: " + e.getMessage());
                    // Don't fail task rejection if appointment update fails
                }
            }
            
            System.out.println("======================");
            
            return savedTask;
        }
        throw new RuntimeException("Task not found");
    }

    public Task startTask(String taskId, TaskActionRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus("in-progress");
            task.setUpdatedAt(LocalDateTime.now());
            
            // Add task update
            TaskUpdate update = new TaskUpdate("in-progress", "Work started on task", LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found");
    }

    public Task completeTask(String taskId, TaskActionRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus("completed");
            task.setUpdatedAt(LocalDateTime.now());
            
            // Add task update
            TaskUpdate update = new TaskUpdate("completed", "Task completed: " + request.getNotes(), LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            // Send notification to admin (use admin ID from task, or skip if not available)
            if (task.getAssignedAdminId() != null && !task.getAssignedAdminId().isEmpty()) {
                try {
                    notificationService.sendAdminNotification(
                        task.getAssignedAdminId(),
                        request.getEmployeeId(),
                        "success",
                        "Task Completed",
                        task.getCustomerName() + "'s " + task.getServiceType() + " has been completed",
                        taskId,
                        null
                    );
                    System.out.println("✓ Notification sent to admin: " + task.getAssignedAdminId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to send notification to admin: " + e.getMessage());
                }
            }
            
            // Send notification to customer (use customer ID from task)
            if (task.getCustomerId() != null && !task.getCustomerId().isEmpty()) {
                try {
                    notificationService.sendCustomerNotification(
                        task.getCustomerId(),
                        request.getEmployeeId(),
                        "success",
                        "Service Completed",
                        "Your " + task.getServiceType() + " for " + task.getVehicleInfo() + " has been completed. Your vehicle is ready for pickup!",
                        taskId,
                        null
                    );
                    System.out.println("✓ Notification sent to customer: " + task.getCustomerId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to send notification to customer: " + e.getMessage());
                }
            }
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found");
    }

    public Task deliverTask(String taskId, TaskActionRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus("delivered");
            task.setUpdatedAt(LocalDateTime.now());
            
            // Add task update
            TaskUpdate update = new TaskUpdate("delivered", "Vehicle delivered to customer: " + request.getNotes(), LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            // Send notification to admin (use admin ID from task, or skip if not available)
            if (task.getAssignedAdminId() != null && !task.getAssignedAdminId().isEmpty()) {
                try {
                    notificationService.sendAdminNotification(
                        task.getAssignedAdminId(),
                        request.getEmployeeId(),
                        "success",
                        "Task Delivered",
                        task.getCustomerName() + "'s " + task.getServiceType() + " has been delivered",
                        taskId,
                        null
                    );
                    System.out.println("✓ Notification sent to admin: " + task.getAssignedAdminId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to send notification to admin: " + e.getMessage());
                }
            }
            
            // Send notification to customer (use customer ID from task)
            if (task.getCustomerId() != null && !task.getCustomerId().isEmpty()) {
                try {
                    notificationService.sendCustomerNotification(
                        task.getCustomerId(),
                        request.getEmployeeId(),
                        "success",
                        "Vehicle Delivered",
                        "Your " + task.getServiceType() + " for " + task.getVehicleInfo() + " has been delivered. Thank you for choosing our service!",
                        taskId,
                        null
                    );
                    System.out.println("✓ Notification sent to customer: " + task.getCustomerId());
                } catch (Exception e) {
                    System.err.println("✗ Failed to send notification to customer: " + e.getMessage());
                }
            }
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found");
    }
}

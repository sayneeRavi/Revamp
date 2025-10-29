package com.revamp.employee.service;

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

    public List<Task> getEmployeeTasks(String employeeId) {
        return taskRepository.findByAssignedEmployeeId(employeeId);
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
            task.setStatus("assigned"); // Keep as assigned for admin to reassign
            task.setUpdatedAt(LocalDateTime.now());
            
            // Add task update
            TaskUpdate update = new TaskUpdate("rejected", "Task rejected by employee: " + request.getNotes(), LocalDateTime.now(), request.getEmployeeId());
            if (task.getUpdates() == null) {
                task.setUpdates(new ArrayList<>());
            }
            task.getUpdates().add(update);
            
            // Send notification to admin
            notificationService.sendAdminNotification(
                "ADMIN001", // Admin ID
                request.getEmployeeId(),
                "warning",
                "Task Rejected",
                task.getCustomerName() + "'s " + task.getServiceType() + " has been rejected",
                taskId,
                null
            );
            
            return taskRepository.save(task);
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
            
            // Send notification to admin
            notificationService.sendAdminNotification(
                "ADMIN001", // Admin ID
                request.getEmployeeId(),
                "success",
                "Task Completed",
                task.getCustomerName() + "'s " + task.getServiceType() + " has been completed",
                taskId,
                null
            );
            
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
            
            // Send notification to admin
            notificationService.sendAdminNotification(
                "ADMIN001", // Admin ID
                request.getEmployeeId(),
                "success",
                "Task Delivered",
                task.getCustomerName() + "'s " + task.getServiceType() + " has been delivered",
                taskId,
                null
            );
            
            return taskRepository.save(task);
        }
        throw new RuntimeException("Task not found");
    }
}

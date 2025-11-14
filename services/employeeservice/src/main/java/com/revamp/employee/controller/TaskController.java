package com.revamp.employee.controller;

import com.revamp.employee.dto.CreateTaskRequest;
import com.revamp.employee.dto.TaskActionRequest;
import com.revamp.employee.model.Task;
import com.revamp.employee.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody CreateTaskRequest request) {
        try {
            System.out.println("===== Creating Task in Employee Service =====");
            System.out.println("Request: " + request);
            System.out.println("Customer: " + request.getCustomerName());
            System.out.println("Employee ID: " + request.getAssignedEmployeeId());
            System.out.println("Admin ID: " + request.getAssignedAdminId());
            
            Task task = taskService.createTask(request);
            
            System.out.println("✓ Task created successfully - ID: " + task.getId());
            System.out.println("  Customer: " + task.getCustomerName());
            System.out.println("  Employee: " + task.getAssignedEmployeeId());
            System.out.println("  Status: " + task.getStatus());
            
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            System.err.println("✗ ERROR creating task: " + e.getMessage());
            System.err.println("  Exception type: " + e.getClass().getName());
            e.printStackTrace();
            
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("message", "Failed to create task: " + e.getMessage());
            error.put("error", "TaskCreationError");
            error.put("details", e.getClass().getName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Task>> getEmployeeTasks(@PathVariable String employeeId) {
        List<Task> tasks = taskService.getEmployeeTasks(employeeId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/employee/{employeeId}/status/{status}")
    public ResponseEntity<List<Task>> getEmployeeTasksByStatus(@PathVariable String employeeId, @PathVariable String status) {
        List<Task> tasks = taskService.getEmployeeTasksByStatus(employeeId, status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}/employee/{employeeId}")
    public ResponseEntity<Task> getTaskById(@PathVariable String taskId, @PathVariable String employeeId) {
        Optional<Task> task = taskService.getTaskById(taskId, employeeId);
        if (task.isPresent()) {
            return ResponseEntity.ok(task.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{taskId}/accept")
    public ResponseEntity<Task> acceptTask(@PathVariable String taskId, @RequestBody TaskActionRequest request) {
        try {
            Task task = taskService.acceptTask(taskId, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{taskId}/reject")
    public ResponseEntity<Task> rejectTask(@PathVariable String taskId, @RequestBody TaskActionRequest request) {
        try {
            Task task = taskService.rejectTask(taskId, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{taskId}/start")
    public ResponseEntity<Task> startTask(@PathVariable String taskId, @RequestBody TaskActionRequest request) {
        try {
            Task task = taskService.startTask(taskId, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<Task> completeTask(@PathVariable String taskId, @RequestBody TaskActionRequest request) {
        try {
            Task task = taskService.completeTask(taskId, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{taskId}/deliver")
    public ResponseEntity<Task> deliverTask(@PathVariable String taskId, @RequestBody TaskActionRequest request) {
        try {
            Task task = taskService.deliverTask(taskId, request);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

package com.revamp.employee.controller;

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

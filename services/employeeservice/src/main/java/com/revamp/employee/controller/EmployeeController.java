package com.revamp.employee.controller;

import com.revamp.employee.dto.AvailabilityRequest;
import com.revamp.employee.dto.CreateEmployeeRequest;
import com.revamp.employee.dto.EmployeeUpdateRequest;
import com.revamp.employee.model.Employee;
import com.revamp.employee.model.TimeLog;
import com.revamp.employee.service.EmployeeService;
import com.revamp.employee.service.TimeTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private TimeTrackingService timeTrackingService;

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody CreateEmployeeRequest request) {
        try {
            Employee employee = employeeService.createEmployee(request);
            return ResponseEntity.status(201).body(employee);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("error", "Failed to create employee");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Employee> getEmployeeByUserId(@PathVariable String userId) {
        Optional<Employee> employee = employeeService.getEmployeeByUserId(userId);
        if (employee.isPresent()) {
            return ResponseEntity.ok(employee.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<Employee> getEmployeeProfile(@PathVariable String employeeId) {
        Optional<Employee> employee = employeeService.getEmployeeByEmployeeId(employeeId);
        if (employee.isPresent()) {
            return ResponseEntity.ok(employee.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile/{employeeId}")
    public ResponseEntity<Employee> updateEmployeeProfile(@PathVariable String employeeId, @RequestBody EmployeeUpdateRequest request) {
        try {
            Employee updatedEmployee = employeeService.updateEmployeeProfile(employeeId, request);
            return ResponseEntity.ok(updatedEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/availability/{employeeId}")
    public ResponseEntity<Map<String, Object>> updateAvailability(@PathVariable String employeeId, @RequestBody AvailabilityRequest request) {
        try {
            Employee updatedEmployee = employeeService.updateAvailability(employeeId, request.isAvailable());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Availability updated successfully");
            response.put("isAvailable", updatedEmployee.isAvailable());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Employee not found");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<Map<String, Object>> getWorkHistory(@PathVariable String employeeId) {
        // Fetch work history from time logs
        List<TimeLog> timeLogs = timeTrackingService.getEmployeeTimeLogs(employeeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("timeLogs", timeLogs);
        response.put("totalLogs", timeLogs.size());
        
        // Calculate total hours worked including all sessions
        long totalMinutes = timeLogs.stream()
            .mapToLong(log -> {
                long logMinutes = 0;
                
                // Add duration from sessions (pause/resume cycles)
                if (log.getSessions() != null && !log.getSessions().isEmpty()) {
                    logMinutes += log.getSessions().stream()
                        .filter(session -> session.getDuration() != null)
                        .mapToLong(session -> session.getDuration().toMinutes())
                        .sum();
                }
                
                // Add final duration if completed
                if (log.getDuration() != null) {
                    logMinutes += log.getDuration().toMinutes();
                }
                
                // If no sessions and no duration, but has start and end time, calculate it
                if (logMinutes == 0 && log.getStartTime() != null && log.getEndTime() != null) {
                    logMinutes = java.time.Duration.between(log.getStartTime(), log.getEndTime()).toMinutes();
                }
                
                return logMinutes;
            })
            .sum();
        response.put("totalHoursWorked", totalMinutes / 60.0);
        
        return ResponseEntity.ok(response);
    }
}

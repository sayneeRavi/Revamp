package com.revamp.employee.controller;

import com.revamp.employee.dto.AvailabilityRequest;
import com.revamp.employee.dto.EmployeeUpdateRequest;
import com.revamp.employee.model.Employee;
import com.revamp.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

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
        // This would typically return work history data
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("message", "Work history endpoint - to be implemented with time logs");
        return ResponseEntity.ok(response);
    }
}

package com.revamp.employee.employee.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.revamp.employee.employee.model.EmployeeDetail;
import com.revamp.employee.employee.service.EmployeeDetailService;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeDetailController {

    @Autowired
    private EmployeeDetailService employeeDetailService;

    // Employee Details DTO
    public static class EmployeeDetailRequest {
        public String userId;
        public String fullName;
        public String email;
        public String phoneNumber;
        public String[] skills;
    }

    // Add employee details
    @PostMapping("/employee-details")
    public ResponseEntity<?> addEmployeeDetails(@RequestBody EmployeeDetailRequest req) {
        try {
            // Check if details already exist
            if (employeeDetailService.existsByEmail(req.email)) {
                return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Employee details already exist"));
            }
            
            EmployeeDetail detail = new EmployeeDetail(
                req.userId,
                req.fullName,
                req.email,
                req.phoneNumber,
                req.skills
            );
            
            EmployeeDetail saved = employeeDetailService.save(detail);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Error saving employee details: " + ex.getMessage()));
        }
    }

    // Get all employee details
    @GetMapping("/employee-details")
    public ResponseEntity<?> getAllEmployeeDetails() {
        try {
            List<EmployeeDetail> details = employeeDetailService.findAllByOrderByFullName();
            return ResponseEntity.ok(details);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("message", "Error fetching employee details: " + ex.getMessage()));
        }
    }

    // Get employee details by userId
    @GetMapping("/employee-details/{userId}")
    public ResponseEntity<?> getEmployeeDetailsByUserId(@PathVariable String userId) {
        try {
            EmployeeDetail detail = employeeDetailService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee details not found"));
            return ResponseEntity.ok(detail);
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    // Delete employee details by userId
    @DeleteMapping("/employee-details/{userId}")
    public ResponseEntity<?> deleteEmployeeDetails(@PathVariable String userId) {
        try {
            EmployeeDetail detail = employeeDetailService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee details not found"));
            
            employeeDetailService.delete(detail.getId());
            return ResponseEntity.ok(Collections.singletonMap("message", "Employee details deleted successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    // Update employee details
    @PutMapping("/employee-details/{userId}")
    public ResponseEntity<?> updateEmployeeDetails(@PathVariable String userId, @RequestBody EmployeeDetailRequest req) {
        try {
            EmployeeDetail detail = employeeDetailService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee details not found"));
            
            // Update fields
            if (req.fullName != null && !req.fullName.isEmpty()) {
                detail.setFullName(req.fullName);
            }
            if (req.email != null && !req.email.isEmpty()) {
                detail.setEmail(req.email);
            }
            if (req.phoneNumber != null) {
                detail.setPhoneNumber(req.phoneNumber);
            }
            if (req.skills != null) {
                detail.setSkills(req.skills);
            }
            
            EmployeeDetail updated = employeeDetailService.update(detail);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }
}


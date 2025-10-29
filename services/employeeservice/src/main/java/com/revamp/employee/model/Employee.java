package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    private String id;
    private String username;
    private String email;
    private String phone;
    private String department;
    private String specialization;
    private String experienceLevel;
    private boolean isAvailable;
    private LocalDateTime lastActive;
    private List<String> skills;
    private String employeeId; // EMP001, EMP002, etc.
    private String userId; // Reference to auth service user
}

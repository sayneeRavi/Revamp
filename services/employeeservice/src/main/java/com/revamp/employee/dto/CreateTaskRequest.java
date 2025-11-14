package com.revamp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    private String customerId;
    private String customerName;
    private String vehicleInfo;
    private String serviceType; // "service" or "modification"
    private String description;
    private String priority; // "low", "medium", "high"
    private int estimatedHours;
    private LocalDateTime assignedDate;
    private LocalDateTime dueDate;
    private String assignedEmployeeId;
    private String assignedAdminId; // Admin who assigned the task
    private String instructions;
}






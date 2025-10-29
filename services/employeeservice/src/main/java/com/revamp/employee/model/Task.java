package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    private String id;
    private String customerId;
    private String customerName;
    private String vehicleInfo;
    private String serviceType; // "service" or "modification"
    private String description;
    private String status; // "assigned", "accepted", "in-progress", "completed", "delivered"
    private String priority; // "low", "medium", "high"
    private int estimatedHours;
    private LocalDateTime assignedDate;
    private LocalDateTime dueDate;
    private String assignedEmployeeId;
    private String instructions;
    private List<TaskUpdate> updates;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    private String recipientId; // Admin ID
    private String senderId; // Employee ID
    private String type; // "success", "warning", "error", "info"
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private boolean isRead;
    private String taskId;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}

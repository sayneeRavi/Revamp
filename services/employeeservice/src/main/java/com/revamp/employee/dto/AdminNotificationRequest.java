package com.revamp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationRequest {
    private String recipientId; // Admin ID
    private String senderId; // Employee ID
    private String type; // "success", "warning", "error", "info"
    private String title;
    private String message;
    private String taskId;
    private Map<String, Object> metadata;
}

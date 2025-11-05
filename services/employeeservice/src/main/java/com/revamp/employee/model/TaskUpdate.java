package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskUpdate {
    private String status;
    private String message;
    private LocalDateTime timestamp;
    private String updatedBy; // Employee ID
}

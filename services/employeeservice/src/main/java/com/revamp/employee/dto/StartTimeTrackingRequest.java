package com.revamp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartTimeTrackingRequest {
    private String employeeId;
    private String taskId;
    private String notes;
}

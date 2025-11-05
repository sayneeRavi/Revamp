package com.revamp.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeUpdateRequest {
    private String username;
    private String phone;
    private String department;
    private String specialization;
    private String experienceLevel;
    private List<String> skills;
}

package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSession {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Duration duration;
}

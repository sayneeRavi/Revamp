package com.revamp.employee.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "time_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeLog {
    @Id
    private String id;
    private String employeeId;
    private String taskId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Duration duration;
    private String status; // "active", "paused", "completed"
    private List<TimeSession> sessions; // For pause/resume tracking
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

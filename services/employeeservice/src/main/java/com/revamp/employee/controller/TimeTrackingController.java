package com.revamp.employee.controller;

import com.revamp.employee.dto.StartTimeTrackingRequest;
import com.revamp.employee.model.TimeLog;
import com.revamp.employee.service.TimeTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/time-tracking")
@CrossOrigin(origins = "*")
public class TimeTrackingController {

    @Autowired
    private TimeTrackingService timeTrackingService;

    @PostMapping("/start")
    public ResponseEntity<TimeLog> startTimeTracking(@RequestBody StartTimeTrackingRequest request) {
        try {
            TimeLog timeLog = timeTrackingService.startTimeTracking(request);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/stop/{timeLogId}")
    public ResponseEntity<TimeLog> stopTimeTracking(@PathVariable String timeLogId) {
        try {
            TimeLog timeLog = timeTrackingService.stopTimeTracking(timeLogId);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/pause/{timeLogId}")
    public ResponseEntity<TimeLog> pauseTimeTracking(@PathVariable String timeLogId) {
        try {
            TimeLog timeLog = timeTrackingService.pauseTimeTracking(timeLogId);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/resume/{timeLogId}")
    public ResponseEntity<TimeLog> resumeTimeTracking(@PathVariable String timeLogId) {
        try {
            TimeLog timeLog = timeTrackingService.resumeTimeTracking(timeLogId);
            return ResponseEntity.ok(timeLog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TimeLog>> getEmployeeTimeLogs(@PathVariable String employeeId) {
        List<TimeLog> timeLogs = timeTrackingService.getEmployeeTimeLogs(employeeId);
        return ResponseEntity.ok(timeLogs);
    }

    @GetMapping("/active/{employeeId}")
    public ResponseEntity<TimeLog> getActiveTimeLog(@PathVariable String employeeId) {
        Optional<TimeLog> timeLog = timeTrackingService.getActiveTimeLog(employeeId);
        if (timeLog.isPresent()) {
            return ResponseEntity.ok(timeLog.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeLog>> getTaskTimeLogs(@PathVariable String taskId) {
        List<TimeLog> timeLogs = timeTrackingService.getTaskTimeLogs(taskId);
        return ResponseEntity.ok(timeLogs);
    }
}

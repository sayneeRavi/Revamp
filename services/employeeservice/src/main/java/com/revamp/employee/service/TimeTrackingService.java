package com.revamp.employee.service;

import com.revamp.employee.dto.StartTimeTrackingRequest;
import com.revamp.employee.model.TimeLog;
import com.revamp.employee.model.TimeSession;
import com.revamp.employee.repository.TimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TimeTrackingService {

    @Autowired
    private TimeLogRepository timeLogRepository;

    public TimeLog startTimeTracking(StartTimeTrackingRequest request) {
        // Stop any existing active time log for this employee
        Optional<TimeLog> activeLogOpt = timeLogRepository.findByEmployeeIdAndStatus(request.getEmployeeId(), "active");
        if (activeLogOpt.isPresent()) {
            TimeLog activeLog = activeLogOpt.get();
            activeLog.setStatus("paused");
            activeLog.setUpdatedAt(LocalDateTime.now());
            timeLogRepository.save(activeLog);
        }

        // Create new time log
        TimeLog timeLog = new TimeLog();
        timeLog.setEmployeeId(request.getEmployeeId());
        timeLog.setTaskId(request.getTaskId());
        timeLog.setStartTime(LocalDateTime.now());
        timeLog.setStatus("active");
        timeLog.setNotes(request.getNotes());
        timeLog.setSessions(new ArrayList<>());
        timeLog.setCreatedAt(LocalDateTime.now());
        timeLog.setUpdatedAt(LocalDateTime.now());

        return timeLogRepository.save(timeLog);
    }

    public TimeLog stopTimeTracking(String timeLogId) {
        Optional<TimeLog> timeLogOpt = timeLogRepository.findById(timeLogId);
        if (timeLogOpt.isPresent()) {
            TimeLog timeLog = timeLogOpt.get();
            timeLog.setEndTime(LocalDateTime.now());
            timeLog.setStatus("completed");
            timeLog.setUpdatedAt(LocalDateTime.now());

            // Calculate total duration
            Duration totalDuration = Duration.between(timeLog.getStartTime(), timeLog.getEndTime());
            timeLog.setDuration(totalDuration);

            return timeLogRepository.save(timeLog);
        }
        throw new RuntimeException("Time log not found");
    }

    public TimeLog pauseTimeTracking(String timeLogId) {
        Optional<TimeLog> timeLogOpt = timeLogRepository.findById(timeLogId);
        if (timeLogOpt.isPresent()) {
            TimeLog timeLog = timeLogOpt.get();
            timeLog.setStatus("paused");
            timeLog.setUpdatedAt(LocalDateTime.now());

            // Add current session
            TimeSession session = new TimeSession();
            session.setStartTime(timeLog.getStartTime());
            session.setEndTime(LocalDateTime.now());
            session.setDuration(Duration.between(timeLog.getStartTime(), LocalDateTime.now()));
            
            if (timeLog.getSessions() == null) {
                timeLog.setSessions(new ArrayList<>());
            }
            timeLog.getSessions().add(session);

            return timeLogRepository.save(timeLog);
        }
        throw new RuntimeException("Time log not found");
    }

    public TimeLog resumeTimeTracking(String timeLogId) {
        Optional<TimeLog> timeLogOpt = timeLogRepository.findById(timeLogId);
        if (timeLogOpt.isPresent()) {
            TimeLog timeLog = timeLogOpt.get();
            timeLog.setStatus("active");
            timeLog.setStartTime(LocalDateTime.now()); // Reset start time for new session
            timeLog.setUpdatedAt(LocalDateTime.now());

            return timeLogRepository.save(timeLog);
        }
        throw new RuntimeException("Time log not found");
    }

    public List<TimeLog> getEmployeeTimeLogs(String employeeId) {
        return timeLogRepository.findByEmployeeId(employeeId);
    }

    public Optional<TimeLog> getActiveTimeLog(String employeeId) {
        return timeLogRepository.findByEmployeeIdAndStatus(employeeId, "active");
    }

    public List<TimeLog> getTaskTimeLogs(String taskId) {
        return timeLogRepository.findByTaskId(taskId);
    }
}

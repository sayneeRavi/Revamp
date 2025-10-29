package com.revamp.employee.repository;

import com.revamp.employee.model.TimeLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends MongoRepository<TimeLog, String> {
    List<TimeLog> findByEmployeeId(String employeeId);
    Optional<TimeLog> findByEmployeeIdAndStatus(String employeeId, String status);
    List<TimeLog> findByTaskId(String taskId);
}

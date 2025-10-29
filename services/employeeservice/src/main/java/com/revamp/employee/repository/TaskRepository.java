package com.revamp.employee.repository;

import com.revamp.employee.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedEmployeeId(String employeeId);
    List<Task> findByAssignedEmployeeIdAndStatus(String employeeId, String status);
    Optional<Task> findByIdAndAssignedEmployeeId(String taskId, String employeeId);
}

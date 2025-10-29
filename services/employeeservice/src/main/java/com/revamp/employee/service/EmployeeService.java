package com.revamp.employee.service;

import com.revamp.employee.dto.EmployeeUpdateRequest;
import com.revamp.employee.model.Employee;
import com.revamp.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public Optional<Employee> getEmployeeById(String employeeId) {
        return employeeRepository.findById(employeeId);
    }

    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }

    public Optional<Employee> getEmployeeByUserId(String userId) {
        return employeeRepository.findByUserId(userId);
    }

    public Employee updateEmployeeProfile(String employeeId, EmployeeUpdateRequest request) {
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeId(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setUsername(request.getUsername());
            employee.setPhone(request.getPhone());
            employee.setDepartment(request.getDepartment());
            employee.setSpecialization(request.getSpecialization());
            employee.setExperienceLevel(request.getExperienceLevel());
            employee.setSkills(request.getSkills());
            return employeeRepository.save(employee);
        }
        throw new RuntimeException("Employee not found");
    }

    public Employee updateAvailability(String employeeId, boolean isAvailable) {
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeId(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setAvailable(isAvailable);
            employee.setLastActive(LocalDateTime.now());
            return employeeRepository.save(employee);
        }
        throw new RuntimeException("Employee not found");
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
}

package com.revamp.employee.service;

import com.revamp.employee.dto.CreateEmployeeRequest;
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

    /**
     * Create a new employee record.
     * Generates employeeId automatically (EMP001, EMP002, etc.)
     */
    public Employee createEmployee(CreateEmployeeRequest request) {
        // Check if employee already exists for this userId
        Optional<Employee> existing = employeeRepository.findByUserId(request.getUserId());
        if (existing.isPresent()) {
            throw new RuntimeException("Employee already exists for userId: " + request.getUserId());
        }

        // Generate employeeId (EMP001, EMP002, etc.)
        String employeeId = generateNextEmployeeId();

        Employee employee = new Employee();
        employee.setUserId(request.getUserId());
        employee.setEmployeeId(employeeId);
        employee.setUsername(request.getUsername());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartment(request.getDepartment());
        employee.setSpecialization(request.getSpecialization());
        employee.setExperienceLevel(request.getExperienceLevel());
        employee.setSkills(request.getSkills());
        employee.setAvailable(true);
        employee.setLastActive(LocalDateTime.now());

        return employeeRepository.save(employee);
    }

    /**
     * Generate the next employee ID (EMP001, EMP002, etc.)
     */
    private String generateNextEmployeeId() {
        List<Employee> allEmployees = employeeRepository.findAll();
        
        if (allEmployees.isEmpty()) {
            return "EMP001";
        }

        // Find the highest employeeId number
        int maxNumber = 0;
        for (Employee emp : allEmployees) {
            if (emp.getEmployeeId() != null && emp.getEmployeeId().startsWith("EMP")) {
                try {
                    String numberPart = emp.getEmployeeId().substring(3); // Remove "EMP" prefix
                    int number = Integer.parseInt(numberPart);
                    if (number > maxNumber) {
                        maxNumber = number;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid employeeId format
                }
            }
        }

        // Generate next ID
        int nextNumber = maxNumber + 1;
        return String.format("EMP%03d", nextNumber);
    }
}

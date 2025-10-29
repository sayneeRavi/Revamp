package com.revamp.employee.config;

import com.revamp.employee.model.Employee;
import com.revamp.employee.model.Task;
import com.revamp.employee.repository.EmployeeRepository;
import com.revamp.employee.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize sample employees
        if (employeeRepository.count() == 0) {
            Employee employee1 = new Employee();
            employee1.setEmployeeId("EMP001");
            employee1.setUsername("John Employee");
            employee1.setEmail("john.employee@revamp.com");
            employee1.setPhone("+1 (555) 123-4567");
            employee1.setDepartment("Service Department");
            employee1.setSpecialization("General Service");
            employee1.setExperienceLevel("Mid-level (2-5 years)");
            employee1.setAvailable(true);
            employee1.setLastActive(LocalDateTime.now());
            employee1.setSkills(Arrays.asList("oil_change", "brake_service", "transmission"));
            employee1.setUserId("user001");

            Employee employee2 = new Employee();
            employee2.setEmployeeId("EMP002");
            employee2.setUsername("Sarah Technician");
            employee2.setEmail("sarah.technician@revamp.com");
            employee2.setPhone("+1 (555) 234-5678");
            employee2.setDepartment("Service Department");
            employee2.setSpecialization("Engine Specialist");
            employee2.setExperienceLevel("Senior (5+ years)");
            employee2.setAvailable(true);
            employee2.setLastActive(LocalDateTime.now());
            employee2.setSkills(Arrays.asList("engine_repair", "ecu_tuning", "performance"));
            employee2.setUserId("user002");

            employeeRepository.saveAll(Arrays.asList(employee1, employee2));
        }

        // Initialize sample tasks
        if (taskRepository.count() == 0) {
            Task task1 = new Task();
            task1.setCustomerId("CUST001");
            task1.setCustomerName("John Smith");
            task1.setVehicleInfo("2020 Honda Civic - Red");
            task1.setServiceType("service");
            task1.setDescription("Oil change and brake inspection");
            task1.setStatus("assigned");
            task1.setPriority("medium");
            task1.setEstimatedHours(2);
            task1.setAssignedDate(LocalDateTime.now());
            task1.setDueDate(LocalDateTime.now().plusDays(1));
            task1.setAssignedEmployeeId("EMP001");
            task1.setInstructions("Check brake pads and replace if needed");
            task1.setCreatedAt(LocalDateTime.now());
            task1.setUpdatedAt(LocalDateTime.now());

            Task task2 = new Task();
            task2.setCustomerId("CUST002");
            task2.setCustomerName("Sarah Johnson");
            task2.setVehicleInfo("2019 Toyota Camry - Blue");
            task2.setServiceType("modification");
            task2.setDescription("Engine upgrade and ECU tuning");
            task2.setStatus("assigned");
            task2.setPriority("high");
            task2.setEstimatedHours(8);
            task2.setAssignedDate(LocalDateTime.now());
            task2.setDueDate(LocalDateTime.now().plusDays(3));
            task2.setAssignedEmployeeId("EMP002");
            task2.setInstructions("Follow manufacturer guidelines for engine swap");
            task2.setCreatedAt(LocalDateTime.now());
            task2.setUpdatedAt(LocalDateTime.now());

            Task task3 = new Task();
            task3.setCustomerId("CUST003");
            task3.setCustomerName("Mike Wilson");
            task3.setVehicleInfo("2021 Ford Mustang - Black");
            task3.setServiceType("service");
            task3.setDescription("Transmission service");
            task3.setStatus("assigned");
            task3.setPriority("low");
            task3.setEstimatedHours(3);
            task3.setAssignedDate(LocalDateTime.now());
            task3.setDueDate(LocalDateTime.now().plusDays(2));
            task3.setAssignedEmployeeId("EMP001");
            task3.setInstructions("Replace transmission fluid and filter");
            task3.setCreatedAt(LocalDateTime.now());
            task3.setUpdatedAt(LocalDateTime.now());

            taskRepository.saveAll(Arrays.asList(task1, task2, task3));
        }
    }
}

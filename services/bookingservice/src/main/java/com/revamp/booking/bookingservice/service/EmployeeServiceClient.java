package com.revamp.booking.bookingservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Client service to communicate with the Employee Service API.
 * Used to create tasks when employees are assigned to appointments.
 */
@Service
public class EmployeeServiceClient {

    @Value("${employee.api.base:http://localhost:8083}")
    private String employeeServiceBaseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public EmployeeServiceClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        // Configure ObjectMapper to handle Java 8 time types
        this.objectMapper.findAndRegisterModules();
    }

    /**
     * Get employee by userId to retrieve the employeeId (EMP001, etc.)
     * 
     * @param userId The user ID from auth service
     * @return The employee record as a Map, or null if not found
     */
    public Map<String, Object> getEmployeeByUserId(String userId) {
        try {
            String url = employeeServiceBaseUrl + "/api/employees/by-user/" + userId;
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> employee = objectMapper.readValue(response.body(), Map.class);
                System.out.println("✓ Successfully fetched employee record for userId: " + userId);
                System.out.println("  Employee data: " + employee);
                return employee;
            } else if (response.statusCode() == 404) {
                System.err.println("✗ Employee not found for userId: " + userId + " (404 Not Found)");
                System.err.println("  Response: " + response.body());
                return null;
            } else {
                System.err.println("✗ Failed to get employee by userId. Status: " + response.statusCode());
                System.err.println("  Response: " + response.body());
                return null;
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error calling employee service to get employee: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Create a task in the employee service for an assigned employee.
     * 
     * @param taskData Map containing task data to be sent to employee service
     * @return The created task as a Map, or null if creation failed
     */
    public Map<String, Object> createTask(Map<String, Object> taskData) {
        try {
            String url = employeeServiceBaseUrl + "/api/tasks";
            String jsonBody = objectMapper.writeValueAsString(taskData);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                Map<String, Object> createdTask = objectMapper.readValue(response.body(), Map.class);
                System.out.println("✓ Task created successfully in employee service");
                System.out.println("  Task ID: " + createdTask.get("id"));
                System.out.println("  Employee ID: " + createdTask.get("assignedEmployeeId"));
                return createdTask;
            } else {
                System.err.println("✗ Failed to create task in employee service. Status: " + response.statusCode());
                System.err.println("  Response: " + response.body());
                // Try to parse error response
                try {
                    Map<String, Object> errorData = objectMapper.readValue(response.body(), Map.class);
                    System.err.println("  Error message: " + errorData.get("message"));
                    System.err.println("  Error type: " + errorData.get("error"));
                } catch (Exception e) {
                    System.err.println("  Could not parse error response");
                }
                return null;
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error calling employee service to create task: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}


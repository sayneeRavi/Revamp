package com.revamp.employee.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Client service to communicate with the Booking Service API.
 * Used to update appointments when tasks are rejected.
 */
@Service
public class BookingServiceClient {

    @Value("${booking.api.base:http://localhost:8084}")
    private String bookingServiceBaseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public BookingServiceClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules();
    }

    /**
     * Remove an employee from an appointment when task is rejected.
     * This updates the appointment to remove the employee from assignedEmployeeIds.
     * 
     * @param customerId The customer ID
     * @param employeeId The employee ID to remove
     * @param employeeName The employee name to remove
     * @return true if successful, false otherwise
     */
    public boolean removeEmployeeFromAppointment(String customerId, String employeeId, String employeeName) {
        try {
            String url = bookingServiceBaseUrl + "/api/bookings/appointments/v1/remove-employee";
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("customerId", customerId);
            requestBody.put("employeeId", employeeId);
            requestBody.put("employeeName", employeeName != null ? employeeName : "");
            
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> result = objectMapper.readValue(response.body(), Map.class);
                System.out.println("✓ Successfully removed employee from appointment");
                System.out.println("  Appointment ID: " + result.get("appointmentId"));
                System.out.println("  Status: " + result.get("status"));
                System.out.println("  Remaining employees: " + result.get("remainingEmployees"));
                return true;
            } else {
                System.err.println("✗ Failed to remove employee from appointment. Status: " + response.statusCode());
                System.err.println("  Response: " + response.body());
                try {
                    Map<String, Object> errorData = objectMapper.readValue(response.body(), Map.class);
                    System.err.println("  Error message: " + errorData.get("message"));
                } catch (Exception e) {
                    System.err.println("  Could not parse error response");
                }
                return false;
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("Error calling booking service to remove employee: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}




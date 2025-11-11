package com.revamp.booking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String customerId;
    private String customerName;
    private String customerEmail;

    private String vehicleId; // optional if new vehicle
    private VehicleDetails vehicleDetails; // if provided

    private String serviceType; // Service | Modification

    private LocalDate date;

    // For services
    private String timeSlotId;
    private String timeSlotStart; // HH:mm
    private String timeSlotEnd;   // HH:mm

    // For modifications
    private List<String> neededModifications;

    private Integer estimatedTimeHours; // may be null for service
    private Integer estimatedCost; // integer LKR

    private String instructions;

    private String status; // pending, approved, in_progress, completed

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class VehicleDetails {
        private String make;
        private String model;
        private Integer year;
        private String registrationNumber;
    }
}

package com.revamp.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AppointmentRequest {
    @NotBlank
    private String serviceType; // Service | Modification

    @NotBlank
    private String date; // yyyy-MM-dd

    private String timeSlotId; // required for Service

    private String vehicleId; // optional
    private VehicleDetails vehicleDetails; // optional

    private List<String> neededModifications; // for Modification

    private Integer estimatedTimeHours; // optional
    private Integer estimatedCost; // optional

    private String instructions;

    @Data
    public static class VehicleDetails {
        private String make;
        private String model;
        private Integer year;
        private String registrationNumber;
    }
}

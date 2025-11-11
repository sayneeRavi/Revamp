package com.revamp.booking.bookingservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
	@Id
	private String id;
	
	private String customerId;
	private String customerName;
	private String customerEmail;
	private String vehicle;
	private String vehicleId; // From Booking model
	private VehicleDetails vehicleDetails; // From Booking model
	private String serviceType; // "Service" or "Modification"
	private LocalDate date;
	private LocalTime time;
	private String timeSlotStart; // From Booking model (as String)
	private String timeSlotEnd; // From Booking model (as String)
	private String status; // "Pending", "Approved", "In Progress", "Completed", "Delivered"
	private List<String> assignedEmployeeIds;
	private List<String> assignedEmployeeNames;
	private List<String> modifications; // For modification service
	private List<String> neededModifications; // From Booking model (alias for modifications)
	private Double estimatedCost;
	private Integer estimatedTimeHours; // From Booking model
	private String timeSlotId; // For service bookings
	private LocalTime endTime; // Calculated end time
	private String instructions; // From Booking model
	private java.time.LocalDateTime createdAt; // From Booking model
	private java.time.LocalDateTime updatedAt; // From Booking model
	
	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class VehicleDetails {
		private String make;
		private String model;
		private Integer year;
		private String registrationNumber;
	}
}


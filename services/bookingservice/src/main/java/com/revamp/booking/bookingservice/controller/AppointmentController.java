package com.revamp.booking.bookingservice.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.revamp.booking.bookingservice.model.Appointment;
import com.revamp.booking.bookingservice.service.AppointmentService;
import com.revamp.booking.dto.AppointmentRequest;
import com.revamp.booking.util.JwtUtil;
import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/bookings/appointments/v1")
@CrossOrigin(origins = "*")
public class AppointmentController {

	@Autowired
	private AppointmentService appointmentService;

	@Autowired
	private JwtUtil jwtUtil;

	/**
	 * Create a new appointment
	 */
	@PostMapping
	public ResponseEntity<?> createAppointment(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestBody AppointmentRequest request) {
		try {
			System.out.println("===== Creating Appointment =====");
			System.out.println("Request body: " + request);
			
			// Extract customer information from JWT token
			String customerId = null;
			String customerName = null;
			String customerEmail = null;

			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				try {
					System.out.println("Extracting JWT token...");
					System.out.println("Auth header length: " + authHeader.length());
					System.out.println("Auth header (first 50 chars): " + authHeader.substring(0, Math.min(50, authHeader.length())));
					
					Claims claims = jwtUtil.parseToken(authHeader);
					System.out.println("JWT Claims extracted successfully");
					System.out.println("All claims keys: " + claims.keySet());
					System.out.println("Claims subject: " + claims.getSubject());
					System.out.println("Claims email: " + claims.get("email"));
					System.out.println("Claims username: " + claims.get("username"));
					
					customerId = jwtUtil.getCustomerId(claims);
					customerName = jwtUtil.getCustomerName(claims);
					customerEmail = jwtUtil.getCustomerEmail(claims);
					
					System.out.println("Extracted customer info:");
					System.out.println("  Customer ID: " + customerId);
					System.out.println("  Customer Name: " + customerName);
					System.out.println("  Customer Email: " + customerEmail);
					
					// Validate that we got customer info
					if (customerId == null || customerId.isEmpty()) {
						System.err.println("WARNING: Customer ID is null or empty after JWT parsing!");
						System.err.println("This might indicate an issue with JWT token structure or secret mismatch.");
					}
					if (customerEmail == null || customerEmail.isEmpty()) {
						System.err.println("WARNING: Customer email is null or empty after JWT parsing!");
					}
				} catch (Exception e) {
					System.err.println("ERROR parsing JWT token: " + e.getMessage());
					System.err.println("Exception type: " + e.getClass().getName());
					e.printStackTrace();
					Map<String, Object> errorResponse = new java.util.HashMap<>();
					errorResponse.put("message", "Invalid or expired token: " + e.getMessage());
					errorResponse.put("error", "Unauthorized");
					errorResponse.put("details", e.getClass().getName());
					return ResponseEntity.status(401).body(errorResponse);
				}
			} else {
				System.err.println("ERROR: No Authorization header or invalid format");
				if (authHeader != null) {
					System.err.println("Auth header value: " + authHeader);
				} else {
					System.err.println("Auth header is null");
				}
				Map<String, Object> errorResponse = new java.util.HashMap<>();
				errorResponse.put("message", "Authorization header is required");
				errorResponse.put("error", "Unauthorized");
				return ResponseEntity.status(401).body(errorResponse);
			}
			
			// Validate customer information before proceeding
			if (customerId == null || customerId.isEmpty()) {
				System.err.println("ERROR: Customer ID cannot be null or empty");
				Map<String, Object> errorResponse = new java.util.HashMap<>();
				errorResponse.put("message", "Customer information could not be extracted from token. Please ensure you are logged in.");
				errorResponse.put("error", "InvalidToken");
				return ResponseEntity.status(401).body(errorResponse);
			}

			// Convert AppointmentRequest to Appointment
			Appointment appointment = new Appointment();
			appointment.setCustomerId(customerId);
			appointment.setCustomerName(customerName);
			appointment.setCustomerEmail(customerEmail);
			appointment.setServiceType(request.getServiceType());
			appointment.setDate(LocalDate.parse(request.getDate()));
			appointment.setTimeSlotId(request.getTimeSlotId());
			appointment.setInstructions(request.getInstructions());
			appointment.setNeededModifications(request.getNeededModifications());
			appointment.setEstimatedTimeHours(request.getEstimatedTimeHours());
			if (request.getEstimatedCost() != null) {
				appointment.setEstimatedCost(request.getEstimatedCost().doubleValue());
			}
			appointment.setCreatedAt(LocalDateTime.now());
			appointment.setUpdatedAt(LocalDateTime.now());

			System.out.println("Appointment before vehicle processing:");
			System.out.println("  Customer ID: " + appointment.getCustomerId());
			System.out.println("  Customer Name: " + appointment.getCustomerName());
			System.out.println("  Customer Email: " + appointment.getCustomerEmail());
			System.out.println("  Vehicle ID: " + appointment.getVehicleId());
			System.out.println("  Vehicle: " + appointment.getVehicle());
			System.out.println("  Instructions: " + appointment.getInstructions());

			// Handle vehicle information
			if (request.getVehicleId() != null && !request.getVehicleId().isEmpty()) {
				appointment.setVehicleId(request.getVehicleId());
				System.out.println("Set vehicleId from request: " + request.getVehicleId());
			}

			if (request.getVehicleDetails() != null) {
				System.out.println("Processing vehicleDetails from request");
				Appointment.VehicleDetails vehicleDetails = new Appointment.VehicleDetails();
				vehicleDetails.setMake(request.getVehicleDetails().getMake());
				vehicleDetails.setModel(request.getVehicleDetails().getModel());
				vehicleDetails.setYear(request.getVehicleDetails().getYear());
				vehicleDetails.setRegistrationNumber(request.getVehicleDetails().getRegistrationNumber());
				appointment.setVehicleDetails(vehicleDetails);
				
				// Also set vehicle as a string for backward compatibility
				if (request.getVehicleDetails().getRegistrationNumber() != null) {
					appointment.setVehicle(request.getVehicleDetails().getRegistrationNumber());
					System.out.println("Set vehicle from registrationNumber: " + request.getVehicleDetails().getRegistrationNumber());
				} else if (request.getVehicleDetails().getMake() != null && request.getVehicleDetails().getModel() != null) {
					appointment.setVehicle(request.getVehicleDetails().getMake() + " " + request.getVehicleDetails().getModel());
					System.out.println("Set vehicle from make/model: " + appointment.getVehicle());
				}
			} else if (request.getInstructions() != null && request.getInstructions().toLowerCase().contains("vehicle:")) {
				// Extract vehicle from instructions if present (e.g., "Vehicle: test#1")
				System.out.println("Extracting vehicle from instructions");
				String instructions = request.getInstructions();
				int vehicleIndex = instructions.toLowerCase().indexOf("vehicle:");
				if (vehicleIndex >= 0) {
					String vehiclePart = instructions.substring(vehicleIndex + "vehicle:".length()).trim();
					// Take the first line or until newline
					if (vehiclePart.contains("\n")) {
						vehiclePart = vehiclePart.substring(0, vehiclePart.indexOf("\n")).trim();
					}
					appointment.setVehicle(vehiclePart);
					System.out.println("Extracted vehicle from instructions: " + vehiclePart);
				}
			}

			System.out.println("Appointment before saving:");
			System.out.println("  Customer ID: " + appointment.getCustomerId());
			System.out.println("  Customer Name: " + appointment.getCustomerName());
			System.out.println("  Customer Email: " + appointment.getCustomerEmail());
			System.out.println("  Vehicle ID: " + appointment.getVehicleId());
			System.out.println("  Vehicle: " + appointment.getVehicle());
			System.out.println("  Vehicle Details: " + appointment.getVehicleDetails());

			Appointment created = appointmentService.createAppointment(appointment);
			
			System.out.println("Appointment after saving:");
			System.out.println("  ID: " + created.getId());
			System.out.println("  Customer ID: " + created.getCustomerId());
			System.out.println("  Customer Name: " + created.getCustomerName());
			System.out.println("  Customer Email: " + created.getCustomerEmail());
			System.out.println("  Vehicle ID: " + created.getVehicleId());
			System.out.println("  Vehicle: " + created.getVehicle());
			System.out.println("  Vehicle Details: " + created.getVehicleDetails());
			System.out.println("=====================================");
			
			return ResponseEntity.ok(created);
		} catch (RuntimeException e) {
			// Return error message for validation errors
			Map<String, Object> errorResponse = new java.util.HashMap<>();
			errorResponse.put("message", e.getMessage());
			errorResponse.put("error", e.getClass().getSimpleName());
			return ResponseEntity.badRequest().body(errorResponse);
		} catch (Exception e) {
			Map<String, Object> errorResponse = new java.util.HashMap<>();
			errorResponse.put("message", "Failed to create appointment: " + e.getMessage());
			errorResponse.put("error", "InternalServerError");
			e.printStackTrace();
			return ResponseEntity.status(500).body(errorResponse);
		}
	}

	/**
	 * Get appointment by ID
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
		try {
			return appointmentService.getAppointmentById(id)
					.map(ResponseEntity::ok)
					.orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get all appointments
	 */
	@GetMapping
	public ResponseEntity<?> getAllAppointments() {
		try {
			System.out.println("===== Fetching All Appointments =====");
			System.out.println("Querying bookings collection...");
			List<Appointment> appointments = appointmentService.getAllAppointments();
			System.out.println("DEBUG: Controller returning " + appointments.size() + " appointment(s) from bookings collection");
			for (Appointment apt : appointments) {
				System.out.println("Appointment ID: " + apt.getId() + 
					", Customer: " + apt.getCustomerName() + 
					", Status: " + apt.getStatus() +
					", Assigned Employees: " + (apt.getAssignedEmployeeNames() != null ? apt.getAssignedEmployeeNames().toString() : "None"));
			}
			System.out.println("======================================");
			return ResponseEntity.ok(appointments);
		} catch (Exception e) {
			System.err.println("ERROR: Failed to get appointments: " + e.getMessage());
			e.printStackTrace();
			Map<String, Object> errorResponse = new java.util.HashMap<>();
			errorResponse.put("message", "Error fetching appointments: " + e.getMessage());
			errorResponse.put("error", "InternalServerError");
			return ResponseEntity.status(500).body(errorResponse);
		}
	}

	/**
	 * Get appointments by customer ID
	 */
	@GetMapping("/customer/{customerId}")
	public ResponseEntity<List<Appointment>> getAppointmentsByCustomerId(@PathVariable String customerId) {
		try {
			List<Appointment> appointments = appointmentService.getAppointmentsByCustomerId(customerId);
			return ResponseEntity.ok(appointments);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Update appointment status
	 */
	@PutMapping("/{id}/status")
	public ResponseEntity<Appointment> updateAppointmentStatus(
			@PathVariable String id,
			@RequestBody Map<String, String> request) {
		try {
			String status = request.get("status");
			Appointment appointment = appointmentService.updateAppointmentStatus(id, status);
			return ResponseEntity.ok(appointment);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Assign employees to appointment
	 */
	@PutMapping("/{id}/assign-employees")
	public ResponseEntity<?> assignEmployees(
			@PathVariable String id,
			@RequestBody Map<String, Object> request) {
		try {
			System.out.println("===== Assign Employees Request =====");
			System.out.println("Appointment ID: " + id);
			System.out.println("Request body: " + request);
			
			@SuppressWarnings("unchecked")
			List<String> employeeIds = (List<String>) request.get("employeeIds");
			@SuppressWarnings("unchecked")
			List<String> employeeNames = (List<String>) request.get("employeeNames");
			
			if (employeeIds == null || employeeIds.isEmpty()) {
				Map<String, Object> errorResponse = new java.util.HashMap<>();
				errorResponse.put("message", "Employee IDs are required");
				errorResponse.put("error", "ValidationError");
				return ResponseEntity.badRequest().body(errorResponse);
			}
			
			if (employeeNames == null || employeeNames.isEmpty()) {
				Map<String, Object> errorResponse = new java.util.HashMap<>();
				errorResponse.put("message", "Employee names are required");
				errorResponse.put("error", "ValidationError");
				return ResponseEntity.badRequest().body(errorResponse);
			}
			
			Appointment appointment = appointmentService.assignEmployees(id, employeeIds, employeeNames);
			System.out.println("✓ Employees assigned successfully to appointment: " + id);
			System.out.println("Assigned employees: " + employeeNames);
			return ResponseEntity.ok(appointment);
		} catch (RuntimeException e) {
			System.err.println("ERROR assigning employees: " + e.getMessage());
			e.printStackTrace();
			Map<String, Object> errorResponse = new java.util.HashMap<>();
			errorResponse.put("message", e.getMessage());
			errorResponse.put("error", e.getClass().getSimpleName());
			return ResponseEntity.badRequest().body(errorResponse);
		} catch (Exception e) {
			System.err.println("ERROR assigning employees: " + e.getMessage());
			e.printStackTrace();
			Map<String, Object> errorResponse = new java.util.HashMap<>();
			errorResponse.put("message", "Failed to assign employees: " + e.getMessage());
			errorResponse.put("error", "InternalServerError");
			return ResponseEntity.status(500).body(errorResponse);
		}
	}

	/**
	 * Cancel appointment
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<?> cancelAppointment(@PathVariable String id) {
		try {
			appointmentService.cancelAppointment(id);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get appointments by date range
	 */
	@GetMapping("/range")
	public ResponseEntity<List<Appointment>> getAppointmentsByDateRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		try {
			List<Appointment> appointments = appointmentService.getAppointmentsByDateRange(startDate, endDate);
			return ResponseEntity.ok(appointments);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Validate booking before creation
	 * This endpoint can be called by other services to validate bookings
	 */
	@PostMapping("/validate")
	public ResponseEntity<Map<String, Object>> validateBooking(@RequestBody Map<String, Object> request) {
		try {
			String serviceType = (String) request.get("serviceType");
			String dateStr = (String) request.get("date");
			String timeSlotId = (String) request.get("timeSlotId");
			
			if (dateStr == null) {
				return ResponseEntity.badRequest()
					.body(Map.of("isValid", false, "message", "Date is required"));
			}
			
			LocalDate date = LocalDate.parse(dateStr);
			Map<String, Object> result = new java.util.HashMap<>();
			
			// Check if date is unavailable
			boolean isUnavailable = appointmentService.isDateUnavailable(date);
			boolean isSunday = date.getDayOfWeek().getValue() == 7;
			
			if (isUnavailable || isSunday) {
				result.put("isValid", false);
				if (isUnavailable) {
					result.put("message", "Selected date is unavailable (holiday/maintenance)");
				} else {
					result.put("message", "Shop is closed on Sundays");
				}
				return ResponseEntity.ok(result);
			}
			
			// For Service type, validate time slot
			if ("Service".equals(serviceType)) {
				if (timeSlotId == null || timeSlotId.isEmpty()) {
					result.put("isValid", false);
					result.put("message", "Time slot ID is required for Service bookings");
					return ResponseEntity.ok(result);
				}
				
				// Check if time slot exists and is available
				Optional<com.revamp.booking.bookingservice.model.TimeSlot> slotOpt = 
					appointmentService.getTimeSlotById(timeSlotId);
				
				if (!slotOpt.isPresent()) {
					result.put("isValid", false);
					result.put("message", "Time slot not found");
					return ResponseEntity.ok(result);
				}
				
				com.revamp.booking.bookingservice.model.TimeSlot slot = slotOpt.get();
				
				if (!slot.isAvailable()) {
					result.put("isValid", false);
					result.put("message", "Time slot is already booked");
					return ResponseEntity.ok(result);
				}
				
				if (!slot.getDate().equals(date)) {
					result.put("isValid", false);
					result.put("message", "Time slot date does not match selected date");
					return ResponseEntity.ok(result);
				}
			}
			
			// Validation passed
			result.put("isValid", true);
			result.put("message", "Booking is valid");
			return ResponseEntity.ok(result);
			
		} catch (Exception e) {
			return ResponseEntity.badRequest()
				.body(Map.of("isValid", false, "message", "Error validating booking: " + e.getMessage()));
		}
	}
}


package com.revamp.booking.bookingservice.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.revamp.booking.bookingservice.model.Appointment;
import com.revamp.booking.bookingservice.model.TimeSlot;

@Service
public class AppointmentService {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private TimeSlotService timeSlotService;

	@Autowired
	private UnavailableDateService unavailableDateService;

	/**
	 * Create a new appointment
	 */
	public Appointment createAppointment(Appointment appointment) {
		System.out.println("===== AppointmentService.createAppointment =====");
		System.out.println("Input appointment data:");
		System.out.println("  Customer ID: " + appointment.getCustomerId());
		System.out.println("  Customer Name: " + appointment.getCustomerName());
		System.out.println("  Customer Email: " + appointment.getCustomerEmail());
		System.out.println("  Vehicle ID: " + appointment.getVehicleId());
		System.out.println("  Vehicle: " + appointment.getVehicle());
		System.out.println("  Vehicle Details: " + appointment.getVehicleDetails());
		System.out.println("  Service Type: " + appointment.getServiceType());
		System.out.println("  Date: " + appointment.getDate());
		System.out.println("  Status: " + appointment.getStatus());
		
		// Check if date is unavailable (for both Service and Modification)
		if (unavailableDateService.isDateUnavailable(appointment.getDate())) {
			throw new RuntimeException("Selected date is unavailable (holiday/maintenance)");
		}
		
		// Check if it's Sunday (for both Service and Modification)
		if (appointment.getDate().getDayOfWeek().getValue() == 7) {
			throw new RuntimeException("Shop is closed on Sundays");
		}
		
		// For Service type, book the time slot
		if ("Service".equals(appointment.getServiceType())) {
			if (appointment.getTimeSlotId() == null || appointment.getTimeSlotId().isEmpty()) {
				throw new RuntimeException("Time slot ID is required for Service appointments");
			}
			
			// Book the time slot
			TimeSlot slot = timeSlotService.bookSlot(appointment.getTimeSlotId(), null);
			appointment.setTime(slot.getStartTime());
			appointment.setEndTime(slot.getEndTime());
			
			// Set timeSlotStart and timeSlotEnd as String (HH:mm format)
			if (slot.getStartTime() != null) {
				appointment.setTimeSlotStart(slot.getStartTime().toString());
			}
			if (slot.getEndTime() != null) {
				appointment.setTimeSlotEnd(slot.getEndTime().toString());
			}
		} else {
			// For Modification, can be booked any time during shop hours (8am-5pm)
			if (appointment.getTime() == null) {
				appointment.setTime(LocalTime.of(8, 0)); // Default to 8am
			}
			appointment.setEndTime(LocalTime.of(17, 0)); // End at 5pm
			
			// Set timeSlotStart and timeSlotEnd for modifications
			if (appointment.getTime() != null) {
				appointment.setTimeSlotStart(appointment.getTime().toString());
			}
			if (appointment.getEndTime() != null) {
				appointment.setTimeSlotEnd(appointment.getEndTime().toString());
			}
		}
		
		// Ensure status is set (but don't overwrite if already set)
		if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) {
			appointment.setStatus("Pending");
		}
		
		// Ensure timestamps are set (but don't overwrite if already set)
		if (appointment.getCreatedAt() == null) {
			appointment.setCreatedAt(java.time.LocalDateTime.now());
		}
		if (appointment.getUpdatedAt() == null) {
			appointment.setUpdatedAt(java.time.LocalDateTime.now());
		}
		
		System.out.println("Appointment before saving to MongoDB:");
		System.out.println("  Customer ID: " + appointment.getCustomerId());
		System.out.println("  Customer Name: " + appointment.getCustomerName());
		System.out.println("  Customer Email: " + appointment.getCustomerEmail());
		System.out.println("  Vehicle ID: " + appointment.getVehicleId());
		System.out.println("  Vehicle: " + appointment.getVehicle());
		System.out.println("  Vehicle Details: " + appointment.getVehicleDetails());
		System.out.println("  Service Type: " + appointment.getServiceType());
		System.out.println("  Date: " + appointment.getDate());
		System.out.println("  Status: " + appointment.getStatus());
		
		// CRITICAL: Ensure customer info is set (should not be null at this point)
		if (appointment.getCustomerId() == null || appointment.getCustomerId().isEmpty()) {
			System.err.println("ERROR: Customer ID is null before saving! This should not happen.");
			throw new RuntimeException("Customer ID is required but was not set");
		}
		if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
			System.err.println("WARNING: Customer Email is null before saving!");
		}
		
		// Save appointment using insert to ensure it's a new document
		Appointment saved;
		try {
			// Use insert instead of save to ensure it's a new document
			mongoTemplate.insert(appointment);
			saved = appointment; // After insert, the appointment object will have the generated ID
			
			System.out.println("Appointment inserted to MongoDB with ID: " + saved.getId());
		} catch (Exception e) {
			System.err.println("ERROR saving appointment to MongoDB: " + e.getMessage());
			e.printStackTrace();
			// Fallback to save if insert fails (might be due to ID conflict)
			saved = mongoTemplate.save(appointment);
			System.out.println("Used save() fallback, appointment ID: " + saved.getId());
		}
		
		// Verify the saved data by querying it back from MongoDB
		Query verifyQuery = new Query(Criteria.where("_id").is(saved.getId()));
		Appointment verified = mongoTemplate.findOne(verifyQuery, Appointment.class);
		
		System.out.println("=== VERIFICATION: Querying back from MongoDB ===");
		if (verified != null) {
			System.out.println("  ID: " + verified.getId());
			System.out.println("  Customer ID: " + verified.getCustomerId());
			System.out.println("  Customer Name: " + verified.getCustomerName());
			System.out.println("  Customer Email: " + verified.getCustomerEmail());
			System.out.println("  Vehicle ID: " + verified.getVehicleId());
			System.out.println("  Vehicle: " + verified.getVehicle());
			System.out.println("  Vehicle Details: " + verified.getVehicleDetails());
			
			// If verification shows null values, that's a problem
			if (verified.getCustomerId() == null) {
				System.err.println("ERROR: Customer ID is null in database after saving!");
			}
			if (verified.getCustomerEmail() == null) {
				System.err.println("ERROR: Customer Email is null in database after saving!");
			}
			if (verified.getVehicle() == null && verified.getVehicleId() == null && verified.getVehicleDetails() == null) {
				System.err.println("WARNING: All vehicle fields are null in database after saving!");
			}
			
			// Update the saved object with verified data
			saved = verified;
		} else {
			System.err.println("ERROR: Could not verify appointment in database - query returned null!");
		}
		System.out.println("================================================");
		
		// For Service type, update slot with appointment ID
		if ("Service".equals(appointment.getServiceType())) {
			TimeSlot slot = timeSlotService.getSlotById(appointment.getTimeSlotId()).orElse(null);
			if (slot != null) {
				slot.setAppointmentId(saved.getId());
				mongoTemplate.save(slot);
			}
		}
		
		System.out.println("============================================");
		
		return saved;
	}

	/**
	 * Get appointment by ID
	 */
	public Optional<Appointment> getAppointmentById(String id) {
		// Use _id for MongoDB query (Spring Data MongoDB maps id field to _id)
		Query query = new Query(Criteria.where("_id").is(id));
		Appointment appointment = mongoTemplate.findOne(query, Appointment.class);
		
		// Fallback to "id" field if not found
		if (appointment == null) {
			query = new Query(Criteria.where("id").is(id));
			appointment = mongoTemplate.findOne(query, Appointment.class);
		}
		
		return Optional.ofNullable(appointment);
	}

	/**
	 * Get all appointments
	 */
	public List<Appointment> getAllAppointments() {
		List<Appointment> appointments = mongoTemplate.findAll(Appointment.class);
		System.out.println("DEBUG: Found " + appointments.size() + " appointment(s) in database");
		for (Appointment apt : appointments) {
			System.out.println("DEBUG: Appointment ID: " + apt.getId() + ", Customer: " + apt.getCustomerName() + ", Date: " + apt.getDate());
		}
		return appointments;
	}

	/**
	 * Get appointments by customer ID
	 */
	public List<Appointment> getAppointmentsByCustomerId(String customerId) {
		Query query = new Query(Criteria.where("customerId").is(customerId));
		return mongoTemplate.find(query, Appointment.class);
	}

	/**
	 * Update appointment status
	 */
	public Appointment updateAppointmentStatus(String id, String status) {
		// Use _id for MongoDB query (Spring Data MongoDB maps id field to _id)
		Query query = new Query(Criteria.where("_id").is(id));
		Appointment appointment = mongoTemplate.findOne(query, Appointment.class);
		
		// Fallback to "id" field if not found
		if (appointment == null) {
			query = new Query(Criteria.where("id").is(id));
			appointment = mongoTemplate.findOne(query, Appointment.class);
		}
		
		if (appointment == null) {
			throw new RuntimeException("Appointment not found with ID: " + id);
		}
		
		appointment.setStatus(status);
		appointment.setUpdatedAt(java.time.LocalDateTime.now());
		return mongoTemplate.save(appointment);
	}

	/**
	 * Assign employees to appointment
	 */
	public Appointment assignEmployees(String appointmentId, List<String> employeeIds, List<String> employeeNames) {
		// Use _id for MongoDB query (Spring Data MongoDB maps id field to _id)
		Query query = new Query(Criteria.where("_id").is(appointmentId));
		Appointment appointment = mongoTemplate.findOne(query, Appointment.class);
		
		if (appointment == null) {
			// Try with "id" field as fallback
			query = new Query(Criteria.where("id").is(appointmentId));
			appointment = mongoTemplate.findOne(query, Appointment.class);
		}
		
		if (appointment == null) {
			throw new RuntimeException("Appointment not found with ID: " + appointmentId);
		}
		
		appointment.setAssignedEmployeeIds(employeeIds);
		appointment.setAssignedEmployeeNames(employeeNames);
		appointment.setStatus("Approved");
		
		// Update the updatedAt timestamp
		appointment.setUpdatedAt(java.time.LocalDateTime.now());
		
		return mongoTemplate.save(appointment);
	}

	/**
	 * Cancel appointment and release time slot if applicable
	 */
	public void cancelAppointment(String appointmentId) {
		// Use _id for MongoDB query (Spring Data MongoDB maps id field to _id)
		Query query = new Query(Criteria.where("_id").is(appointmentId));
		Appointment appointment = mongoTemplate.findOne(query, Appointment.class);
		
		// Fallback to "id" field if not found
		if (appointment == null) {
			query = new Query(Criteria.where("id").is(appointmentId));
			appointment = mongoTemplate.findOne(query, Appointment.class);
		}
		
		if (appointment != null) {
			// Release time slot if it's a Service appointment
			if ("Service".equals(appointment.getServiceType()) && appointment.getTimeSlotId() != null) {
				timeSlotService.releaseSlot(appointment.getTimeSlotId());
			}
			
			mongoTemplate.remove(appointment);
		}
	}

	/**
	 * Get appointments by date range
	 */
	public List<Appointment> getAppointmentsByDateRange(LocalDate startDate, LocalDate endDate) {
		Query query = new Query(Criteria.where("date").gte(startDate).lte(endDate));
		return mongoTemplate.find(query, Appointment.class);
	}

	/**
	 * Check if a date is unavailable
	 */
	public boolean isDateUnavailable(LocalDate date) {
		return unavailableDateService.isDateUnavailable(date);
	}

	/**
	 * Get time slot by ID
	 */
	public Optional<TimeSlot> getTimeSlotById(String slotId) {
		return timeSlotService.getSlotById(slotId);
	}

	/**
	 * Book a time slot (for use by other services)
	 * This can be called when creating a booking in another service
	 */
	public TimeSlot bookTimeSlot(String slotId, String bookingId) {
		return timeSlotService.bookSlot(slotId, bookingId);
	}

	/**
	 * Release a time slot (for use by other services)
	 * This can be called when cancelling a booking in another service
	 */
	public void releaseTimeSlot(String slotId) {
		timeSlotService.releaseSlot(slotId);
	}
}


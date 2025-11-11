package com.revamp.booking.bookingservice.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

import com.revamp.booking.bookingservice.model.TimeSlot;
import com.revamp.booking.bookingservice.model.UnavailableDate;

@Service
public class TimeSlotService {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private UnavailableDateService unavailableDateService;

	// Service time slots: 8-11, 11-14, 14-17 (3 hours each)
	private static final LocalTime SLOT_1_START = LocalTime.of(8, 0);
	private static final LocalTime SLOT_1_END = LocalTime.of(11, 0);
	private static final LocalTime SLOT_2_START = LocalTime.of(11, 0);
	private static final LocalTime SLOT_2_END = LocalTime.of(14, 0);
	private static final LocalTime SLOT_3_START = LocalTime.of(14, 0);
	private static final LocalTime SLOT_3_END = LocalTime.of(17, 0);

	/**
	 * Generate time slots for a given date range
	 * Shop hours: Monday to Saturday, 8am to 5pm
	 */
	public List<TimeSlot> generateTimeSlots(LocalDate startDate, LocalDate endDate) {
		List<TimeSlot> slots = new ArrayList<>();
		LocalDate current = startDate;

		while (!current.isAfter(endDate)) {
			DayOfWeek dayOfWeek = current.getDayOfWeek();
			
			// Skip Sundays (weekday 7)
			if (dayOfWeek != DayOfWeek.SUNDAY) {
				// Check if date is unavailable
				if (!unavailableDateService.isDateUnavailable(current)) {
					// Create 3 slots for the day
					slots.add(new TimeSlot(current, SLOT_1_START, SLOT_1_END));
					slots.add(new TimeSlot(current, SLOT_2_START, SLOT_2_END));
					slots.add(new TimeSlot(current, SLOT_3_START, SLOT_3_END));
				}
			}
			current = current.plusDays(1);
		}

		return slots;
	}

	/**
	 * Get available time slots for a specific date
	 */
	public List<TimeSlot> getAvailableSlotsForDate(LocalDate date) {
		// Check if date is unavailable
		if (unavailableDateService.isDateUnavailable(date)) {
			return new ArrayList<>();
		}

		// Check if it's Sunday
		if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
			return new ArrayList<>();
		}

		List<TimeSlot> slots = new ArrayList<>();
		slots.add(getOrCreateSlot(date, SLOT_1_START, SLOT_1_END));
		slots.add(getOrCreateSlot(date, SLOT_2_START, SLOT_2_END));
		slots.add(getOrCreateSlot(date, SLOT_3_START, SLOT_3_END));

		return slots.stream()
			.filter(TimeSlot::isAvailable)
			.toList();
	}

	/**
	 * Get or create a time slot for a specific date and time
	 */
	private TimeSlot getOrCreateSlot(LocalDate date, LocalTime startTime, LocalTime endTime) {
		Query query = new Query(Criteria.where("date").is(date)
			.and("startTime").is(startTime)
			.and("endTime").is(endTime));
		
		TimeSlot slot = mongoTemplate.findOne(query, TimeSlot.class);
		
		if (slot == null) {
			slot = new TimeSlot(date, startTime, endTime);
			mongoTemplate.save(slot);
		}
		
		return slot;
	}

	/**
	 * Book a time slot atomically
	 * Uses atomic update to prevent race conditions when multiple customers try to book the same slot
	 */
	public TimeSlot bookSlot(String slotId, String appointmentId) {
		// Use atomic update with condition to prevent race conditions
		Query query = new Query(Criteria.where("id").is(slotId)
			.and("isAvailable").is(true));
		
		Update update = new Update()
			.set("isAvailable", false)
			.set("appointmentId", appointmentId);
		
		// Use findAndModify for atomic operation
		TimeSlot slot = mongoTemplate.findAndModify(
			query,
			update,
			FindAndModifyOptions.options().returnNew(true),
			TimeSlot.class
		);
		
		if (slot == null) {
			// Check if slot exists but is already booked
			Query checkQuery = new Query(Criteria.where("id").is(slotId));
			TimeSlot existingSlot = mongoTemplate.findOne(checkQuery, TimeSlot.class);
			
			if (existingSlot == null) {
				throw new RuntimeException("Time slot not found");
			}
			
			if (!existingSlot.isAvailable()) {
				throw new RuntimeException("Time slot is already booked");
			}
			
			// Slot exists but atomic update failed (shouldn't happen, but handle it)
			throw new RuntimeException("Time slot booking failed. Please try again.");
		}
		
		return slot;
	}

	/**
	 * Release a time slot (when appointment is cancelled)
	 */
	public void releaseSlot(String slotId) {
		Query query = new Query(Criteria.where("id").is(slotId));
		TimeSlot slot = mongoTemplate.findOne(query, TimeSlot.class);
		
		if (slot != null) {
			slot.setAvailable(true);
			slot.setAppointmentId(null);
			mongoTemplate.save(slot);
		}
	}

	/**
	 * Get time slot by ID
	 */
	public Optional<TimeSlot> getSlotById(String slotId) {
		Query query = new Query(Criteria.where("id").is(slotId));
		TimeSlot slot = mongoTemplate.findOne(query, TimeSlot.class);
		return Optional.ofNullable(slot);
	}

	/**
	 * Get all time slots for a date range
	 */
	public List<TimeSlot> getSlotsForDateRange(LocalDate startDate, LocalDate endDate) {
		Query query = new Query(Criteria.where("date").gte(startDate).lte(endDate));
		return mongoTemplate.find(query, TimeSlot.class);
	}

	/**
	 * Check if a date is unavailable (holiday/maintenance)
	 */
	public boolean isDateUnavailable(LocalDate date) {
		return unavailableDateService.isDateUnavailable(date);
	}
}


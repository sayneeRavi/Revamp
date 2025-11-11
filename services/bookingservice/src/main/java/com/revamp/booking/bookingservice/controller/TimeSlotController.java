package com.revamp.booking.bookingservice.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.revamp.booking.bookingservice.model.TimeSlot;
import com.revamp.booking.bookingservice.service.TimeSlotService;

@RestController
@RequestMapping("/api/bookings/timeslots")
@CrossOrigin(origins = "*")
public class TimeSlotController {

	@Autowired
	private TimeSlotService timeSlotService;

	/**
	 * Get available time slots for a specific date
	 */
	@GetMapping("/available/{date}")
	public ResponseEntity<List<TimeSlot>> getAvailableSlots(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		try {
			List<TimeSlot> slots = timeSlotService.getAvailableSlotsForDate(date);
			return ResponseEntity.ok(slots);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get time slots for a date range
	 */
	@GetMapping("/range")
	public ResponseEntity<List<TimeSlot>> getSlotsForDateRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		try {
			List<TimeSlot> slots = timeSlotService.getSlotsForDateRange(startDate, endDate);
			return ResponseEntity.ok(slots);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Generate time slots for a date range
	 */
	@PostMapping("/generate")
	public ResponseEntity<List<TimeSlot>> generateTimeSlots(
			@RequestBody Map<String, String> request) {
		try {
			LocalDate startDate = LocalDate.parse(request.get("startDate"));
			LocalDate endDate = LocalDate.parse(request.get("endDate"));
			List<TimeSlot> slots = timeSlotService.generateTimeSlots(startDate, endDate);
			return ResponseEntity.ok(slots);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get time slot by ID
	 */
	@GetMapping("/{id}")
	public ResponseEntity<TimeSlot> getTimeSlotById(@PathVariable String id) {
		try {
			return timeSlotService.getSlotById(id)
					.map(ResponseEntity::ok)
					.orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Check if a date is available for booking
	 * Returns available slots for Service type, or just availability for Modification
	 */
	@GetMapping("/check-availability/{date}")
	public ResponseEntity<Map<String, Object>> checkDateAvailability(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		try {
			boolean isUnavailable = timeSlotService.isDateUnavailable(date);
			boolean isSunday = date.getDayOfWeek().getValue() == 7;
			
			Map<String, Object> result = new java.util.HashMap<>();
			result.put("date", date.toString());
			result.put("isAvailable", !isUnavailable && !isSunday);
			result.put("isUnavailable", isUnavailable);
			result.put("isSunday", isSunday);
			
			if (!isUnavailable && !isSunday) {
				List<TimeSlot> slots = timeSlotService.getAvailableSlotsForDate(date);
				result.put("availableSlots", slots);
				result.put("slotCount", slots.size());
			} else {
				result.put("availableSlots", new java.util.ArrayList<>());
				result.put("slotCount", 0);
				if (isUnavailable) {
					result.put("message", "This date is unavailable (holiday/maintenance)");
				} else if (isSunday) {
					result.put("message", "Shop is closed on Sundays");
				}
			}
			
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}
}


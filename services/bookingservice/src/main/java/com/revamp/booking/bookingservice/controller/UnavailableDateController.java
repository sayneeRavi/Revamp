package com.revamp.booking.bookingservice.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.revamp.booking.bookingservice.model.UnavailableDate;
import com.revamp.booking.bookingservice.service.UnavailableDateService;

@RestController
@RequestMapping("/api/bookings/unavailable-dates")
@CrossOrigin(origins = "*")
public class UnavailableDateController {

	@Autowired
	private UnavailableDateService unavailableDateService;

	/**
	 * Add an unavailable date
	 */
	@PostMapping
	public ResponseEntity<UnavailableDate> addUnavailableDate(@RequestBody Map<String, Object> request) {
		try {
			LocalDate date = LocalDate.parse(request.get("date").toString());
			String reason = request.get("reason").toString();
			String description = request.getOrDefault("description", "").toString();
			
			UnavailableDate unavailableDate = unavailableDateService.addUnavailableDate(date, reason, description);
			return ResponseEntity.ok(unavailableDate);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Remove an unavailable date
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<?> removeUnavailableDate(@PathVariable String id) {
		try {
			unavailableDateService.removeUnavailableDate(id);
			return ResponseEntity.ok().build();
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get all unavailable dates
	 */
	@GetMapping
	public ResponseEntity<List<UnavailableDate>> getAllUnavailableDates() {
		try {
			List<UnavailableDate> dates = unavailableDateService.getAllUnavailableDates();
			return ResponseEntity.ok(dates);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Get unavailable dates in a date range
	 */
	@GetMapping("/range")
	public ResponseEntity<List<UnavailableDate>> getUnavailableDatesInRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		try {
			List<UnavailableDate> dates = unavailableDateService.getUnavailableDatesInRange(startDate, endDate);
			return ResponseEntity.ok(dates);
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}

	/**
	 * Check if a date is unavailable
	 */
	@GetMapping("/check/{date}")
	public ResponseEntity<Map<String, Boolean>> checkDateAvailability(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		try {
			boolean isUnavailable = unavailableDateService.isDateUnavailable(date);
			return ResponseEntity.ok(Map.of("isUnavailable", isUnavailable));
		} catch (Exception e) {
			return ResponseEntity.badRequest().build();
		}
	}
}


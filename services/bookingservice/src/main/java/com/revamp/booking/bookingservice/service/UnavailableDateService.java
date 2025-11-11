package com.revamp.booking.bookingservice.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.revamp.booking.bookingservice.model.UnavailableDate;

@Service
public class UnavailableDateService {

	@Autowired
	private MongoTemplate mongoTemplate;

	/**
	 * Add an unavailable date
	 */
	public UnavailableDate addUnavailableDate(LocalDate date, String reason, String description) {
		// Check if already exists
		Query query = new Query(Criteria.where("date").is(date));
		UnavailableDate existing = mongoTemplate.findOne(query, UnavailableDate.class);
		
		if (existing != null) {
			existing.setReason(reason);
			existing.setDescription(description);
			return mongoTemplate.save(existing);
		}
		
		UnavailableDate unavailableDate = new UnavailableDate(date, reason);
		unavailableDate.setDescription(description);
		return mongoTemplate.save(unavailableDate);
	}

	/**
	 * Remove an unavailable date
	 */
	public void removeUnavailableDate(String id) {
		Query query = new Query(Criteria.where("id").is(id));
		mongoTemplate.remove(query, UnavailableDate.class);
	}

	/**
	 * Check if a date is unavailable
	 */
	public boolean isDateUnavailable(LocalDate date) {
		Query query = new Query(Criteria.where("date").is(date));
		return mongoTemplate.exists(query, UnavailableDate.class);
	}

	/**
	 * Get all unavailable dates
	 */
	public List<UnavailableDate> getAllUnavailableDates() {
		return mongoTemplate.findAll(UnavailableDate.class);
	}

	/**
	 * Get unavailable dates in a date range
	 */
	public List<UnavailableDate> getUnavailableDatesInRange(LocalDate startDate, LocalDate endDate) {
		Query query = new Query(Criteria.where("date").gte(startDate).lte(endDate));
		return mongoTemplate.find(query, UnavailableDate.class);
	}

	/**
	 * Get unavailable date by ID
	 */
	public Optional<UnavailableDate> getUnavailableDateById(String id) {
		Query query = new Query(Criteria.where("id").is(id));
		UnavailableDate date = mongoTemplate.findOne(query, UnavailableDate.class);
		return Optional.ofNullable(date);
	}
}


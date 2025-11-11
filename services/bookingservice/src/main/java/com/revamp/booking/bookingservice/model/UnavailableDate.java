package com.revamp.booking.bookingservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Document(collection = "unavailabledates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnavailableDate {
	@Id
	private String id;
	
	private LocalDate date;
	private String reason; // e.g., "Holiday", "Shop Closed", "Maintenance"
	private String description; // Optional description
	
	public UnavailableDate(LocalDate date, String reason) {
		this.date = date;
		this.reason = reason;
	}
}


package com.revamp.booking.bookingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
public class MongoConfig {

	@Value("${spring.data.mongodb.uri}")
	private String mongoUri;

	@Value("${spring.data.mongodb.database:bookings}")
	private String databaseName;

	@Value("${modification.services.mongodb.uri:${spring.data.mongodb.uri}}")
	private String modificationServicesMongoUri;

	@Value("${modification.services.mongodb.database:Time-slot}")
	private String modificationServicesDatabase;

	@Bean
	@Primary
	public MongoTemplate mongoTemplate() {
		if (mongoUri == null || mongoUri.trim().isEmpty()) {
			throw new IllegalStateException(
				"ERROR: MongoDB URI is not configured in application.properties!"
			);
		}
		
		// Use the database name from properties, or try to extract from URI
		String dbName = databaseName;
		System.out.println("DEBUG: databaseName from @Value: " + databaseName);
		if (dbName == null || dbName.trim().isEmpty()) {
			// Try to extract from URI if not set in properties
			if (mongoUri.contains("/")) {
				String[] parts = mongoUri.split("/");
				if (parts.length > 1) {
					String dbPart = parts[parts.length - 1];
					if (dbPart.contains("?")) {
						dbName = dbPart.split("\\?")[0];
					} else if (!dbPart.trim().isEmpty()) {
						dbName = dbPart;
					}
				}
			}
			// Fallback if still empty
			if (dbName == null || dbName.trim().isEmpty()) {
				dbName = "bookings";
			}
		}
		
		System.out.println("Creating mongoTemplate for BookingService");
		System.out.println("Database Name: " + dbName);
		
		MongoClient mongoClient = MongoClients.create(mongoUri);
		MongoTemplate template = new MongoTemplate(mongoClient, dbName);
		System.out.println("✓ mongoTemplate created successfully");
		return template;
	}

	/**
	 * Second MongoTemplate for modification services
	 * Connects to Time-slot database where modificationservices collection is stored
	 */
	@Bean
	@Qualifier("modificationServicesTemplate")
	public MongoTemplate modificationServicesTemplate() {
		String uri = modificationServicesMongoUri;
		if (uri == null || uri.trim().isEmpty()) {
			uri = mongoUri; // Fallback to main URI
		}

		// Extract database name from URI or use configured name
		String dbName = modificationServicesDatabase;
		if (uri.contains("/")) {
			String[] parts = uri.split("/");
			if (parts.length > 1) {
				String dbPart = parts[parts.length - 1];
				if (dbPart.contains("?")) {
					String extractedDb = dbPart.split("\\?")[0];
					if (!extractedDb.trim().isEmpty()) {
						dbName = extractedDb;
					}
				} else if (!dbPart.trim().isEmpty()) {
					dbName = dbPart;
				}
			}
		}

		System.out.println("===== Creating Modification Services MongoTemplate =====");
		System.out.println("URI: " + uri.replaceAll(":[^:@]+@", ":****@"));
		System.out.println("Database Name: " + dbName);
		System.out.println("Collection: modificationservices");
		
		MongoClient mongoClient = MongoClients.create(uri);
		MongoTemplate template = new MongoTemplate(mongoClient, dbName);
		System.out.println("✓ Modification Services MongoTemplate created successfully");
		System.out.println("============================================================");
		return template;
	}
}


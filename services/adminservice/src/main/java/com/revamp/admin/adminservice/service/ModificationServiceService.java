package com.revamp.admin.adminservice.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.revamp.admin.adminservice.model.ModificationService;

@Service
public class ModificationServiceService {

	@Autowired
	private MongoTemplate mongoTemplate;

	/**
	 * Add a modification service
	 */
	public ModificationService addModificationService(String name, String description, Double estimatedCost, Integer estimatedHours) {
		System.out.println("===== Adding Modification Service =====");
		System.out.println("Name: " + name);
		System.out.println("Description: " + description);
		System.out.println("Estimated Cost: " + estimatedCost);
		System.out.println("Estimated Hours: " + estimatedHours);
		
		// Validate estimated hours is required
		if (estimatedHours == null || estimatedHours <= 0) {
			throw new IllegalArgumentException("Estimated hours is required and must be a positive integer");
		}
		
		// Check if already exists by name
		Query query = new Query(Criteria.where("name").is(name));
		ModificationService existing = mongoTemplate.findOne(query, ModificationService.class);
		
		if (existing != null) {
			System.out.println("⚠ Service with name '" + name + "' already exists. Updating existing record...");
			System.out.println("Existing ID: " + existing.getId());
			existing.setDescription(description);
			existing.setEstimatedHours(estimatedHours); // Always set estimated hours (required)
			if (estimatedCost != null) {
				existing.setEstimatedCost(estimatedCost);
			}
			ModificationService updated = mongoTemplate.save(existing);
			System.out.println("✓ Updated successfully in Time-slot database");
			System.out.println("Updated ID: " + updated.getId());
			System.out.println("Database: Time-slot");
			System.out.println("================================");
			return updated;
		}
		
		ModificationService modificationService = new ModificationService(name, description);
		modificationService.setEstimatedHours(estimatedHours); // Always set estimated hours (required)
		if (estimatedCost != null) {
			modificationService.setEstimatedCost(estimatedCost);
		}
		ModificationService saved = mongoTemplate.save(modificationService);
		System.out.println("✓ Saved successfully in Time-slot database");
		System.out.println("New ID: " + saved.getId());
		System.out.println("Collection: modificationservices");
		System.out.println("Database: Time-slot");
		System.out.println("================================");
		return saved;
	}

	/**
	 * Remove a modification service
	 */
	public void removeModificationService(String id) {
		System.out.println("===== Removing Modification Service =====");
		System.out.println("Service ID: " + id);
		
		// First check if exists
		Query checkQuery = new Query(Criteria.where("id").is(id));
		ModificationService existing = mongoTemplate.findOne(checkQuery, ModificationService.class);
		
		if (existing != null) {
			System.out.println("Found service: " + existing.getName());
			Query query = new Query(Criteria.where("id").is(id));
			mongoTemplate.remove(query, ModificationService.class);
			System.out.println("✓ Deleted successfully from Time-slot database");
			System.out.println("Collection: modificationservices");
			System.out.println("Database: Time-slot");
		} else {
			System.out.println("⚠ Service with ID '" + id + "' not found in database");
		}
		System.out.println("================================");
	}

	/**
	 * Get all modification services
	 */
	public List<ModificationService> getAllModificationServices() {
		System.out.println("===== Fetching All Modification Services =====");
		List<ModificationService> services = mongoTemplate.findAll(ModificationService.class);
		System.out.println("Found " + services.size() + " service(s) in Time-slot database");
		System.out.println("Collection: modificationservices");
		System.out.println("Database: Time-slot");
		if (services.size() > 0) {
			System.out.println("Services:");
			for (ModificationService service : services) {
				System.out.println("  - ID: " + service.getId() + ", Name: " + service.getName());
			}
		}
		System.out.println("================================");
		return services;
	}

	/**
	 * Get modification service by ID
	 */
	public Optional<ModificationService> getModificationServiceById(String id) {
		System.out.println("===== Fetching Modification Service by ID =====");
		System.out.println("Service ID: " + id);
		Query query = new Query(Criteria.where("id").is(id));
		ModificationService service = mongoTemplate.findOne(query, ModificationService.class);
		if (service != null) {
			System.out.println("✓ Found service: " + service.getName());
		} else {
			System.out.println("⚠ Service with ID '" + id + "' not found");
		}
		System.out.println("================================");
		return Optional.ofNullable(service);
	}
	
	/**
	 * Get database statistics
	 */
	public Map<String, Object> getDatabaseStats() {
		System.out.println("===== Database Statistics =====");
		long count = mongoTemplate.count(new Query(), ModificationService.class);
		System.out.println("Total modification services in database: " + count);
		System.out.println("Collection: modificationservices");
		System.out.println("Database: Time-slot");
		System.out.println("================================");
		return Map.of(
			"collection", "modificationservices",
			"database", "Time-slot",
			"totalServices", count
		);
	}
}


package com.revamp.admin.adminservice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.revamp.admin.adminservice.model.ModificationService;

@RestController
@RequestMapping("/api/admin/health")
@CrossOrigin(origins = "*")
public class HealthController {

	@Autowired
	private MongoTemplate mongoTemplate;

	/**
	 * Health check endpoint
	 */
	@GetMapping
	public ResponseEntity<Map<String, Object>> healthCheck() {
		Map<String, Object> health = new HashMap<>();
		
		try {
			// Test database connection
			String databaseName = mongoTemplate.getDb().getName();
			long serviceCount = mongoTemplate.count(new org.springframework.data.mongodb.core.query.Query(), ModificationService.class);
			
			health.put("status", "UP");
			health.put("database", databaseName);
			health.put("collection", "modificationservices");
			health.put("totalServices", serviceCount);
			health.put("message", "Admin service is running and database is connected");
			
			System.out.println("===== Health Check =====");
			System.out.println("Status: UP");
			System.out.println("Database: " + databaseName);
			System.out.println("Collection: modificationservices");
			System.out.println("Total Services: " + serviceCount);
			System.out.println("Note: Using Time-slot database (shared with booking service)");
			System.out.println("================================");
			
			return ResponseEntity.ok(health);
		} catch (Exception e) {
			health.put("status", "DOWN");
			health.put("error", e.getMessage());
			health.put("message", "Admin service is running but database connection failed");
			
			System.err.println("===== Health Check Failed =====");
			System.err.println("Error: " + e.getMessage());
			System.err.println("================================");
			
			return ResponseEntity.status(503).body(health);
		}
	}
}


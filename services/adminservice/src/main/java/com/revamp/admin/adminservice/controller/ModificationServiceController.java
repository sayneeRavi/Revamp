package com.revamp.admin.adminservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.revamp.admin.adminservice.model.ModificationService;
import com.revamp.admin.adminservice.service.ModificationServiceService;

@RestController
@RequestMapping("/api/admin/modification-services")
@CrossOrigin(origins = "*")
public class ModificationServiceController {

	@Autowired
	private ModificationServiceService modificationServiceService;

	/**
	 * Add a modification service
	 */
	@PostMapping
	public ResponseEntity<?> addModificationService(@RequestBody Map<String, Object> request) {
		try {
			System.out.println("===== Received Request to Add Modification Service =====");
			System.out.println("Request body: " + request);
			
			if (request == null || !request.containsKey("name")) {
				Map<String, String> error = new HashMap<>();
				error.put("error", "Name is required");
				error.put("message", "Modification service name is required");
				System.err.println("✗ Error: Name is required");
				return ResponseEntity.badRequest().body(error);
			}
			
			String name = request.get("name").toString();
			if (name == null || name.trim().isEmpty()) {
				Map<String, String> error = new HashMap<>();
				error.put("error", "Name cannot be empty");
				error.put("message", "Modification service name cannot be empty");
				System.err.println("✗ Error: Name cannot be empty");
				return ResponseEntity.badRequest().body(error);
			}
			
			String description = request.getOrDefault("description", "").toString();
			Double estimatedCost = null;
			Integer estimatedHours = null;
			
			// Validate estimated hours is required
			if (!request.containsKey("estimatedHours") || request.get("estimatedHours") == null || request.get("estimatedHours").toString().trim().isEmpty()) {
				Map<String, String> error = new HashMap<>();
				error.put("error", "Estimated hours is required");
				error.put("message", "Estimated hours is required and must be a positive integer");
				System.err.println("✗ Error: Estimated hours is required");
				return ResponseEntity.badRequest().body(error);
			}
			
			// Parse and validate estimated hours
			try {
				estimatedHours = Integer.parseInt(request.get("estimatedHours").toString());
				if (estimatedHours <= 0) {
					Map<String, String> error = new HashMap<>();
					error.put("error", "Invalid estimated hours");
					error.put("message", "Estimated hours must be a positive integer");
					System.err.println("✗ Error: Estimated hours must be positive - got: " + estimatedHours);
					return ResponseEntity.badRequest().body(error);
				}
			} catch (NumberFormatException e) {
				Map<String, String> error = new HashMap<>();
				error.put("error", "Invalid estimated hours");
				error.put("message", "Estimated hours must be a valid integer");
				System.err.println("✗ Error: Invalid estimated hours - " + e.getMessage());
				return ResponseEntity.badRequest().body(error);
			}
			
			// Parse estimated cost if provided (optional)
			if (request.containsKey("estimatedCost") && request.get("estimatedCost") != null && !request.get("estimatedCost").toString().trim().isEmpty()) {
				try {
					estimatedCost = Double.parseDouble(request.get("estimatedCost").toString());
					if (estimatedCost < 0) {
						Map<String, String> error = new HashMap<>();
						error.put("error", "Invalid estimated cost");
						error.put("message", "Estimated cost cannot be negative");
						System.err.println("✗ Error: Estimated cost cannot be negative");
						return ResponseEntity.badRequest().body(error);
					}
				} catch (NumberFormatException e) {
					Map<String, String> error = new HashMap<>();
					error.put("error", "Invalid estimated cost");
					error.put("message", "Estimated cost must be a valid number");
					System.err.println("✗ Error: Invalid estimated cost - " + e.getMessage());
					return ResponseEntity.badRequest().body(error);
				}
			}
			
			ModificationService service = modificationServiceService.addModificationService(name, description, estimatedCost, estimatedHours);
			System.out.println("✓ Service added successfully with ID: " + service.getId());
			return ResponseEntity.ok(service);
		} catch (Exception e) {
			System.err.println("✗ Error adding modification service: " + e.getMessage());
			e.printStackTrace();
			Map<String, String> error = new HashMap<>();
			error.put("error", "Failed to add modification service");
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	/**
	 * Remove a modification service
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<?> removeModificationService(@PathVariable String id) {
		try {
			modificationServiceService.removeModificationService(id);
			Map<String, String> response = new HashMap<>();
			response.put("message", "Modification service removed successfully");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			System.err.println("✗ Error removing modification service: " + e.getMessage());
			e.printStackTrace();
			Map<String, String> error = new HashMap<>();
			error.put("error", "Failed to remove modification service");
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	/**
	 * Get all modification services
	 */
	@GetMapping
	public ResponseEntity<?> getAllModificationServices() {
		try {
			List<ModificationService> services = modificationServiceService.getAllModificationServices();
			return ResponseEntity.ok(services);
		} catch (Exception e) {
			System.err.println("✗ Error fetching modification services: " + e.getMessage());
			e.printStackTrace();
			Map<String, String> error = new HashMap<>();
			error.put("error", "Failed to fetch modification services");
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	/**
	 * Get modification service by ID
	 */
	@GetMapping("/{id}")
	public ResponseEntity<?> getModificationServiceById(@PathVariable String id) {
		try {
			return modificationServiceService.getModificationServiceById(id)
					.map(ResponseEntity::ok)
					.orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			System.err.println("✗ Error fetching modification service: " + e.getMessage());
			e.printStackTrace();
			Map<String, String> error = new HashMap<>();
			error.put("error", "Failed to fetch modification service");
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	/**
	 * Get database statistics
	 */
	@GetMapping("/stats")
	public ResponseEntity<?> getDatabaseStats() {
		try {
			Map<String, Object> stats = modificationServiceService.getDatabaseStats();
			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			System.err.println("✗ Error fetching database stats: " + e.getMessage());
			e.printStackTrace();
			Map<String, String> error = new HashMap<>();
			error.put("error", "Failed to fetch database statistics");
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}
}


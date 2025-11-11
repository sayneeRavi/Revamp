package com.revamp.admin.adminservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "modificationservices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModificationService {
	@Id
	private String id;
	
	private String name; // e.g., "Engine Upgrade", "Body Kit", "Audio System"
	private String description; // Optional description
	private Double estimatedCost; // Optional estimated cost
	private Integer estimatedHours; // Optional estimated hours
	
	public ModificationService(String name, String description) {
		this.name = name;
		this.description = description;
	}
}






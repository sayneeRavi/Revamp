package com.revamp.booking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "modificationservices")
public class ModificationItem {
    @Id
    private String id;
    private String name;
    private Integer estimatedHours;
    private Integer unitPrice; // LKR (maps to estimatedCost in ModificationService)
    private Double estimatedCost; // Also support Double for compatibility
    private String description;
}

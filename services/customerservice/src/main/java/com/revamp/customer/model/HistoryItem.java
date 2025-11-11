package com.revamp.customer.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryItem {
  @Id
  private String id;

  private String customerUserId; // owner (JWT sub)
  private String vehicleId;

  private String title;
  // "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED" | custom
  private String status;

  // ISO timestamp strings are fine or store as Instant/Date if you prefer
  private String completedAt;

  private Double cost;

  // Optional denormalized vehicle display (helps your table)
  private String vehicleMake;
  private String vehicleModel;
  private String vehiclePlateNo;
}

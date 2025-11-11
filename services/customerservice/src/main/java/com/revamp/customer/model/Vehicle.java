package com.revamp.customer.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
  @Id
  private String id;

  private String customerUserId; // owner (JWT sub)
  private String make;
  private String model;
  private String plateNo;
  private Integer year;
}

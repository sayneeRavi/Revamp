package com.revamp.customer.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
  @Id
  private String id;

  private String userId; // JWT subject
  private String name;
  private String email;
  private String phone;
  private String address;
  private String profilePicture; // data URL or hosted URL
}

package com.revamp.customer.repo;

import com.revamp.customer.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VehicleRepo extends MongoRepository<Vehicle, String> {
  List<Vehicle> findByCustomerUserId(String customerUserId);
}

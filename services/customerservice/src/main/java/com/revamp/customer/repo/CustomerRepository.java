package com.revamp.customer.repo;

import com.revamp.customer.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CustomerRepository extends MongoRepository<Customer, String> {
  Optional<Customer> findByUserId(String userId);
}

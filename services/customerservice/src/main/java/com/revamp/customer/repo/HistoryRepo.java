package com.revamp.customer.repo;

import com.revamp.customer.model.HistoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HistoryRepo extends MongoRepository<HistoryItem, String> {
  List<HistoryItem> findByCustomerUserId(String customerUserId);
}

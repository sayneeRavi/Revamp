package com.revamp.booking.repository;

import com.revamp.booking.model.ModificationItem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ModificationItemRepository extends MongoRepository<ModificationItem, String> {
}

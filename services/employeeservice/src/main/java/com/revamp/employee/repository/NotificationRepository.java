package com.revamp.employee.repository;

import com.revamp.employee.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientId(String recipientId);
    List<Notification> findByRecipientIdAndIsRead(String recipientId, boolean isRead);
}

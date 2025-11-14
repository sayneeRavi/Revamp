package com.revamp.employee.service;

import com.revamp.employee.dto.AdminNotificationRequest;
import com.revamp.employee.model.Notification;
import com.revamp.employee.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification sendAdminNotification(String recipientId, String senderId, String type, 
                                            String title, String message, String taskId, 
                                            Map<String, Object> metadata) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setSenderId(senderId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTaskId(taskId);
        notification.setMetadata(metadata);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public Notification sendAdminNotification(AdminNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientId(request.getRecipientId());
        notification.setSenderId(request.getSenderId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setTaskId(request.getTaskId());
        notification.setMetadata(request.getMetadata());
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getAdminNotifications(String adminId) {
        return notificationRepository.findByRecipientId(adminId);
    }

    public List<Notification> getUnreadAdminNotifications(String adminId) {
        return notificationRepository.findByRecipientIdAndIsRead(adminId, false);
    }

    public Notification markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found");
    }

    // Employee notification methods
    public Notification sendEmployeeNotification(String employeeId, String adminId, String type, 
                                                String title, String message, String taskId, 
                                                Map<String, Object> metadata) {
        Notification notification = new Notification();
        notification.setRecipientId(employeeId); // Employee receives the notification
        notification.setSenderId(adminId); // Admin sends the notification
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTaskId(taskId);
        notification.setMetadata(metadata);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getEmployeeNotifications(String employeeId) {
        return notificationRepository.findByRecipientId(employeeId);
    }

    public List<Notification> getUnreadEmployeeNotifications(String employeeId) {
        return notificationRepository.findByRecipientIdAndIsRead(employeeId, false);
    }

    // Customer notification methods
    public Notification sendCustomerNotification(String customerId, String senderId, String type, 
                                                String title, String message, String taskId, 
                                                Map<String, Object> metadata) {
        Notification notification = new Notification();
        notification.setRecipientId(customerId); // Customer receives the notification
        notification.setSenderId(senderId); // Employee/Admin sends the notification
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTaskId(taskId);
        notification.setMetadata(metadata);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getCustomerNotifications(String customerId) {
        return notificationRepository.findByRecipientId(customerId);
    }

    public List<Notification> getUnreadCustomerNotifications(String customerId) {
        return notificationRepository.findByRecipientIdAndIsRead(customerId, false);
    }
}

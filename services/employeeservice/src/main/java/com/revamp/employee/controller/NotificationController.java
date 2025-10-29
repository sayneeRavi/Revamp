package com.revamp.employee.controller;

import com.revamp.employee.dto.AdminNotificationRequest;
import com.revamp.employee.model.Notification;
import com.revamp.employee.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/admin")
    public ResponseEntity<Notification> sendAdminNotification(@RequestBody AdminNotificationRequest request) {
        try {
            Notification notification = notificationService.sendAdminNotification(request);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Notification>> getAdminNotifications(@PathVariable String adminId) {
        List<Notification> notifications = notificationService.getAdminNotifications(adminId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/admin/{adminId}/unread")
    public ResponseEntity<List<Notification>> getUnreadAdminNotifications(@PathVariable String adminId) {
        List<Notification> notifications = notificationService.getUnreadAdminNotifications(adminId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        try {
            Notification notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

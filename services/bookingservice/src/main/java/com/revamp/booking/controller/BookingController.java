package com.revamp.booking.controller;

import com.revamp.booking.dto.AppointmentRequest;
import com.revamp.booking.dto.AppointmentResponse;
import com.revamp.booking.model.Booking;
import com.revamp.booking.model.ModificationItem;
import com.revamp.booking.repository.BookingRepository;
import com.revamp.booking.repository.ModificationItemRepository;
import com.revamp.booking.service.BookingService;
import com.revamp.booking.service.StripeService;
import com.revamp.booking.util.JwtUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final ModificationItemRepository modificationItemRepository;
    private final BookingRepository bookingRepository;
    private final StripeService stripeService;
    private final JwtUtil jwtUtil;
    private final MongoTemplate modificationServicesTemplate;

    public BookingController(
            BookingService bookingService,
            ModificationItemRepository modificationItemRepository,
            BookingRepository bookingRepository,
            StripeService stripeService,
            JwtUtil jwtUtil,
            @Qualifier("modificationServicesTemplate") MongoTemplate modificationServicesTemplate
    ) {
        this.bookingService = bookingService;
        this.modificationItemRepository = modificationItemRepository;
        this.bookingRepository = bookingRepository;
        this.stripeService = stripeService;
        this.jwtUtil = jwtUtil;
        this.modificationServicesTemplate = modificationServicesTemplate;
    }

    @GetMapping("/modifications")
    public List<ModificationItem> listModifications() {
        // Use the qualified MongoTemplate to read from Time-slot database
        // where modificationservices collection is stored
        System.out.println("===== Fetching Modification Services =====");
        System.out.println("Using modificationServicesTemplate");
        System.out.println("Collection: modificationservices");
        
        List<ModificationItem> items = modificationServicesTemplate.findAll(ModificationItem.class);
        
        System.out.println("Found " + items.size() + " modification service(s)");
        if (items.size() > 0) {
            System.out.println("Services:");
            for (ModificationItem item : items) {
                System.out.println("  - ID: " + item.getId() + ", Name: " + item.getName());
            }
        }
        System.out.println("============================================");
        
        // Map estimatedCost (Double) to unitPrice (Integer) for compatibility
        items.forEach(item -> {
            if (item.getEstimatedCost() != null && item.getUnitPrice() == null) {
                item.setUnitPrice(item.getEstimatedCost().intValue());
            }
        });
        
        return items;
    }

    @PostMapping("/bookings/appointments")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody AppointmentRequest request
    ) {
        String customerId;
        String customerName;
        String customerEmail;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.parseToken(authHeader);
                customerId = jwtUtil.getCustomerId(claims);
                customerName = jwtUtil.getCustomerName(claims);
                customerEmail = jwtUtil.getCustomerEmail(claims);
            } catch (Exception e) {
                return ResponseEntity.status(401).build();
            }
        } else {
            return ResponseEntity.status(401).build();
        }

        Booking saved = bookingService.createAppointment(customerId, customerName, customerEmail, request);
        return ResponseEntity.ok(new AppointmentResponse(saved.getId(), saved.getStatus()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String customerId;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.parseToken(authHeader);
                customerId = jwtUtil.getCustomerId(claims);
            } catch (Exception e) {
                return ResponseEntity.status(401).build();
            }
        } else {
            return ResponseEntity.status(401).build();
        }
        
        List<Booking> bookings = bookingRepository.findByCustomerId(customerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/appointments")
    public ResponseEntity<List<Booking>> getAllAppointments(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        // Check authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        try {
            Claims claims = jwtUtil.parseToken(authHeader);
            
            // Check if user is admin
            if (!jwtUtil.isAdmin(claims)) {
                return ResponseEntity.status(403).build();
            }
            
            // Get all bookings for admin
            List<Booking> allBookings = bookingRepository.findAll();
            return ResponseEntity.ok(allBookings);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String bookingId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String customerId;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Claims claims = jwtUtil.parseToken(authHeader);
                customerId = jwtUtil.getCustomerId(claims);
            } catch (Exception e) {
                return ResponseEntity.status(401).build();
            }
        } else {
            return ResponseEntity.status(401).build();
        }
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        
        // Verify the booking belongs to the customer
        if (!booking.getCustomerId().equals(customerId)) {
            return ResponseEntity.status(403).build();
        }
        
        bookingRepository.delete(booking);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{bookingId}/payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @PathVariable String bookingId,
            @RequestBody PaymentIntentRequest req
    ) throws StripeException {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        Long amount = booking.getEstimatedCost() != null ? booking.getEstimatedCost().longValue() : req.getAmount();
        PaymentIntent intent = stripeService.createPaymentIntent(amount, "lkr", bookingId);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        response.put("paymentIntentId", intent.getId());
        return ResponseEntity.ok(response);
    }

    @Data
    public static class PaymentIntentRequest {
        private Long amount;
    }
}

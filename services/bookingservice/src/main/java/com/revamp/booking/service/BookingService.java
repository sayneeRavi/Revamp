package com.revamp.booking.service;

import com.revamp.booking.dto.AppointmentRequest;
import com.revamp.booking.model.Booking;
import com.revamp.booking.repository.BookingRepository;
import com.revamp.booking.bookingservice.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final TimeSlotService timeSlotService;

    public Booking createAppointment(String customerId, String customerName, String customerEmail, AppointmentRequest req) {
        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setCustomerName(customerName);
        booking.setCustomerEmail(customerEmail);
        booking.setServiceType(req.getServiceType());
        booking.setDate(LocalDate.parse(req.getDate()));
        booking.setInstructions(req.getInstructions());
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setStatus("pending");

        if (req.getVehicleId() != null) {
            booking.setVehicleId(req.getVehicleId());
        }
        if (req.getVehicleDetails() != null) {
            Booking.VehicleDetails vd = new Booking.VehicleDetails();
            vd.setMake(req.getVehicleDetails().getMake());
            vd.setModel(req.getVehicleDetails().getModel());
            vd.setYear(req.getVehicleDetails().getYear());
            vd.setRegistrationNumber(req.getVehicleDetails().getRegistrationNumber());
            booking.setVehicleDetails(vd);
        }

        if ("Service".equalsIgnoreCase(req.getServiceType())) {
            if (req.getTimeSlotId() == null || req.getTimeSlotId().isBlank()) {
                throw new IllegalArgumentException("timeSlotId is required for service bookings");
            }
            booking.setTimeSlotId(req.getTimeSlotId());
            
            // Fetch time slot details to populate start/end times
            timeSlotService.getSlotById(req.getTimeSlotId()).ifPresent(slot -> {
                booking.setTimeSlotStart(slot.getStartTime().toString());
                booking.setTimeSlotEnd(slot.getEndTime().toString());
            });
        } else {
            booking.setNeededModifications(req.getNeededModifications());
            booking.setEstimatedTimeHours(req.getEstimatedTimeHours());
            booking.setEstimatedCost(req.getEstimatedCost());
        }

        // Save booking first to get ID
        Booking saved = bookingRepository.save(booking);

        // Book the time slot after saving (for Service bookings)
        if ("Service".equalsIgnoreCase(req.getServiceType())) {
            try {
                timeSlotService.bookSlot(req.getTimeSlotId(), saved.getId());
            } catch (RuntimeException e) {
                // If slot booking fails, delete the booking and throw error
                bookingRepository.delete(saved);
                throw new IllegalStateException("Time slot is already booked: " + e.getMessage());
            }
        }

        return saved;
    }
}

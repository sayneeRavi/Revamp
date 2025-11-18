/**
 * Booking validation utilities
 * Use these functions to validate bookings before submission
 */

import { validateDateForBooking, TimeSlot } from "./bookingUtils";

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validate booking data before submission
 * @param bookingData - Booking form data
 * @returns Validation result with errors if any
 */
export async function validateBooking(
  bookingData: {
    serviceType: "Service" | "Modification";
    date: string;
    timeSlotId?: string;
    vehicleId?: string;
    customerId?: string;
  }
): Promise<BookingValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!bookingData.date) {
    errors.push("Date is required");
    return { isValid: false, errors };
  }

  if (!bookingData.serviceType) {
    errors.push("Service type is required");
    return { isValid: false, errors };
  }

  // Check date availability
  try {
    const dateValidation = await validateDateForBooking(bookingData.date);

    if (!dateValidation.isValid) {
      errors.push(dateValidation.message || "Selected date is not available");
      return { isValid: false, errors };
    }

    // For Service type, validate time slot
    if (bookingData.serviceType === "Service") {
      if (!bookingData.timeSlotId) {
        errors.push("Time slot is required for Service bookings");
        return { isValid: false, errors };
      }

      // Check if the selected slot is still available
      if (dateValidation.availableSlots) {
        const selectedSlot = dateValidation.availableSlots.find(
          (slot) => slot.id === bookingData.timeSlotId
        );

        if (!selectedSlot) {
          errors.push("Selected time slot is not available");
          return { isValid: false, errors };
        }
        console.log("dateValidation",dateValidation)
        console.log("selectedSlot",selectedSlot)
        console.log("selectedSlot isAvailable",selectedSlot.available)

        if (!selectedSlot.available) {
          errors.push("Selected time slot has been booked. Please select another slot.");
          return { isValid: false, errors };
        }
      }
    }

    // For Modification type, date validation is sufficient
    // (No time slot needed, available Mon-Sat 8am-5pm)
  } catch (error) {
    errors.push("Error validating booking. Please try again.");
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    warnings,
  };
}

/**
 * Format booking data for API submission
 * Maps to the existing booking collection structure
 */
export function formatBookingForAPI(bookingData: {
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleDetails?: any;
  serviceType: "Service" | "Modification";
  date: string;
  timeSlotId?: string;
  neededModifications?: string[];
  estimatedTime?: string;
  estimatedCost?: number;
  instructions?: string;
  remarks?: string;
}): any {
  const booking: any = {
    customerId: bookingData.customerId,
    customerName: bookingData.customerName,
    vehicleId: bookingData.vehicleId,
    vehicleDetails: bookingData.vehicleDetails,
    serviceType: bookingData.serviceType,
    date: bookingData.date,
    status: "Pending",
  };

  // For Service type, include time slot
  if (bookingData.serviceType === "Service" && bookingData.timeSlotId) {
    booking.timeslot = bookingData.timeSlotId; // Maps to Timeslot field in collection
  }

  // For Modification type, include needed modifications
  if (bookingData.serviceType === "Modification" && bookingData.neededModifications) {
    booking.neededModifications = bookingData.neededModifications;
  }

  // Optional fields
  if (bookingData.estimatedTime) {
    booking.estimatedTime = bookingData.estimatedTime;
  }

  if (bookingData.estimatedCost) {
    booking.estimatedCost = bookingData.estimatedCost;
  }

  if (bookingData.instructions) {
    booking.instructions = bookingData.instructions;
  }

  if (bookingData.remarks) {
    booking.remarks = bookingData.remarks;
  }

  return booking;
}


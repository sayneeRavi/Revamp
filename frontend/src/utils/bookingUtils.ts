/**
 * Utility functions for booking time slots
 * This can be integrated into the customer booking form
 */

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

export interface DateAvailability {
  date: string;
  isAvailable: boolean;
  isUnavailable: boolean;
  isSunday: boolean;
  availableSlots: TimeSlot[];
  slotCount: number;
  message?: string;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

//redaundant function??

/**
 * Check if a date is available for booking and get available time slots
 * @param date - Date string in YYYY-MM-DD format
 * @returns Promise with availability information and available slots
 */
export async function checkDateAvailability(date: string): Promise<DateAvailability> {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/bookings/timeslots/check-availability/${date}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to check date availability");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking date availability:", error);
    throw error;
  }
}

/**
 * Get available time slots for a specific date
 * @param date - Date string in YYYY-MM-DD format
 * @returns Promise with array of available time slots
 */
export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/bookings/timeslots/available/${date}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to get available slots");
    }

    const slots = await response.json();
    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    return [];
  }
}

/**
 * Format time slot for display
 * @param slot - Time slot object
 * @returns Formatted time string (e.g., "8:00 AM - 11:00 AM")
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const start = formatTime(slot.startTime);
  const end = formatTime(slot.endTime);
  return `${start} - ${end}`;
}

/**
 * Format time string to readable format
 * @param time - Time string in HH:mm format
 * @returns Formatted time (e.g., "8:00 AM")
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Validate if a date is available for booking
 * Used for both Service and Modification types
 * @param date - Date string in YYYY-MM-DD format
 * @returns Promise with validation result
 */
export async function validateDateForBooking(date: string): Promise<{
  isValid: boolean;
  message?: string;
  availableSlots?: TimeSlot[];
}> {
  try {
    const availability = await checkDateAvailability(date);

    if (!availability.isAvailable) {
      return {
        isValid: false,
        message: availability.message || "Selected date is not available",
      };
    }

    return {
      isValid: true,
      availableSlots: availability.availableSlots,
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Error checking date availability. Please try again.",
    };
  }
}


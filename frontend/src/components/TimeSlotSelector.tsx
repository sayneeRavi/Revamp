"use client";

import { useEffect, useState } from "react";
import { checkDateAvailability, formatTimeSlot, TimeSlot, DateAvailability } from "../utils/bookingUtils";

interface TimeSlotSelectorProps {
  selectedDate: string;
  serviceType: "Service" | "Modification";
  onSlotSelect: (slotId: string | null, timeSlot: TimeSlot | null) => void;
  disabled?: boolean;
}

export default function TimeSlotSelector({
  selectedDate,
  serviceType,
  onSlotSelect,
  disabled = false,
}: TimeSlotSelectorProps) {
  const [availability, setAvailability] = useState<DateAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || disabled) {
      setAvailability(null);
      setSelectedSlotId(null);
      onSlotSelect(null, null);
      return;
    }

    setLoading(true);
    checkDateAvailability(selectedDate)
      .then((data) => {
        console.log("Date availability data:", data);
        console.log("Available slots:", data.availableSlots);
        setAvailability(data);
        if (!data.isAvailable) {
          setSelectedSlotId(null);
          onSlotSelect(null, null);
        }
      })
      .catch((error) => {
        console.error("Error checking availability:", error);
        setAvailability(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDate, disabled]);

  const handleSlotSelect = (slot: TimeSlot) => {
    // Check if slot is available (default to true if undefined)
    const isSlotAvailable = slot.isAvailable !== false;
    if (!isSlotAvailable || disabled) {
      console.log("Slot selection blocked:", { isAvailable: slot.isAvailable, disabled });
      return;
    }
    console.log("Slot selected:", slot.id, slot);
    setSelectedSlotId(slot.id);
    onSlotSelect(slot.id, slot);
  };

  // For Modification type, don't show time slots
  if (serviceType === "Modification") {
    if (!selectedDate) {
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Modification bookings are available Monday to Saturday, 8am to 5pm.
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">Checking availability...</p>
        </div>
      );
    }

    if (availability && !availability.isAvailable) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            {availability.message || "This date is not available for booking"}
          </p>
        </div>
      );
    }

    if (availability && availability.isAvailable) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ This date is available for modification booking
          </p>
          <p className="text-xs text-green-600 mt-1">
            Shop hours: Monday to Saturday, 8:00 AM - 5:00 PM
          </p>
        </div>
      );
    }

    return null;
  }

  // For Service type, show time slots
  if (!selectedDate) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Please select a date to see available time slots</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Loading available time slots...</p>
      </div>
    );
  }

  if (availability && !availability.isAvailable) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700 font-medium">
          {availability.message || "This date is not available for booking"}
        </p>
      </div>
    );
  }

  // Ensure we have availability and slots
  if (!availability || !availability.availableSlots || availability.availableSlots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700 font-medium">
          No available time slots for this date
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          All time slots have been booked. Please select another date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">Available Time Slots</p>
        <p className="text-xs text-blue-700">
          Each service takes 3 hours. Select a time slot:
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {availability.availableSlots.map((slot) => {
          const isSlotAvailable = slot.isAvailable !== false; // Default to true if undefined
          const isDisabled = !isSlotAvailable || disabled;
          const isSelected = selectedSlotId === slot.id;
          
          return (
            <button
              key={slot.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDisabled) {
                  handleSlotSelect(slot);
                }
              }}
              disabled={isDisabled}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : isSlotAvailable && !disabled
                  ? "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-900 cursor-pointer"
                  : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formatTimeSlot(slot)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">3 hours duration</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedSlotId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ Time slot selected: {formatTimeSlot(availability.availableSlots.find(s => s.id === selectedSlotId)!)}
          </p>
        </div>
      )}
    </div>
  );
}


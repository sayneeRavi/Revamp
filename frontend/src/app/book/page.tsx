"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import { validateBooking, formatBookingForAPI } from "@/utils/bookingValidation";
import { TimeSlot } from "@/utils/bookingUtils";
import { decodeToken, TokenPayload } from "@/utils/jwt";

export default function BookPage() {
  const router = useRouter();
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Form state
  const [serviceType, setServiceType] = useState<"Service" | "Modification">("Service");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [vehicle, setVehicle] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [modifications, setModifications] = useState<string>("");
  const [availableModificationServices, setAvailableModificationServices] = useState<Array<{id: string, name: string, description?: string, estimatedCost?: number, estimatedHours?: number}>>([]);
  const [selectedModificationServices, setSelectedModificationServices] = useState<string[]>([]);

  useEffect(() => {
    // Get user from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser(decoded);
          setCustomerEmail(decoded.email || "");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    // Load modification services when Modification type is selected
    if (serviceType === "Modification") {
      loadModificationServices();
    }
  }, [serviceType]);

  const loadModificationServices = async () => {
    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
      const response = await fetch(`${GATEWAY_URL}/api/admin/modification-services`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const services = await response.json();
        setAvailableModificationServices(services);
      }
    } catch (error) {
      console.error("Error loading modification services:", error);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    if (selectedModificationServices.includes(serviceId)) {
      setSelectedModificationServices(selectedModificationServices.filter(id => id !== serviceId));
    } else {
      setSelectedModificationServices([...selectedModificationServices, serviceId]);
    }
  };

  const handleSlotSelect = (slotId: string | null, timeSlot: TimeSlot | null) => {
    setSelectedSlotId(slotId);
    setSelectedTimeSlot(timeSlot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate form
      if (!selectedDate) {
        setError("Please select a date");
        setLoading(false);
        return;
      }

      if (!vehicle.trim()) {
        setError("Please enter your vehicle information");
        setLoading(false);
        return;
      }

      if (serviceType === "Service" && !selectedSlotId) {
        setError("Please select a time slot");
        setLoading(false);
        return;
      }

      // Validate booking
      if (!user?.userId) {
        setError("User information not available. Please login again.");
        setLoading(false);
        return;
      }
      
      const validation = await validateBooking({
        serviceType,
        date: selectedDate,
        timeSlotId: selectedSlotId || undefined,
        customerId: String(user.userId),
      });

      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        setLoading(false);
        return;
      }

      // Prepare modifications list
      let modificationsList: string[] = [];
      if (serviceType === "Modification") {
        // Combine selected services and custom modifications
        const selectedServiceNames = selectedModificationServices
          .map(id => availableModificationServices.find(s => s.id === id)?.name)
          .filter(name => name) as string[];
        const customMods = modifications.split(",").map(m => m.trim()).filter(m => m);
        modificationsList = [...selectedServiceNames, ...customMods];
      }

      // Prepare booking data
      const bookingData = {
        customerId: user?.userId || "",
        customerName: user?.username || "",
        customerEmail: customerEmail,
        vehicle: vehicle,
        serviceType: serviceType,
        date: selectedDate,
        timeSlotId: selectedSlotId || undefined,
        modifications: serviceType === "Modification" && modificationsList.length > 0 ? modificationsList : undefined,
        status: "Pending",
      };

      // Submit booking
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
      const response = await fetch(`${GATEWAY_URL}/api/bookings/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create booking" }));
        throw new Error((errorData as any).message || "Failed to create booking");
      }

      const booking = await response.json();
      setSuccess("Booking created successfully! Your appointment is pending approval.");
      
      // Reset form
      setSelectedDate("");
      setSelectedSlotId(null);
      setSelectedTimeSlot(null);
      setVehicle("");
      setModifications("");
      setSelectedModificationServices([]);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/consumer-dashboard");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An error occurred while creating the booking");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
          <p className="text-gray-600">Select a date and time slot for your vehicle service</p>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("Service");
                    setSelectedSlotId(null);
                    setSelectedTimeSlot(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    serviceType === "Service"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
                  }`}
                >
                  <div className="font-semibold">Service</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Regular maintenance (3 hours)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType("Modification");
                    setSelectedSlotId(null);
                    setSelectedTimeSlot(null);
                    setSelectedModificationServices([]);
                    setModifications("");
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    serviceType === "Modification"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
                  }`}
                >
                  <div className="font-semibold">Modification</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Custom modifications (Full day)
                  </div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotId(null);
                  setSelectedTimeSlot(null);
                }}
                min={today}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Shop is closed on Sundays. Please select a weekday.
              </p>
            </div>

            {/* Time Slot Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {serviceType === "Service" ? "Select Time Slot" : "Availability Check"}
                <span className="text-red-500">*</span>
              </label>
              <TimeSlotSelector
                selectedDate={selectedDate}
                serviceType={serviceType}
                onSlotSelect={handleSlotSelect}
                disabled={loading}
              />
            </div>

            {/* Vehicle Information */}
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Information <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vehicle"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g., Toyota Camry 2020"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Modifications (only for Modification type) */}
            {serviceType === "Modification" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Modification Services
                </label>
                {availableModificationServices.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {availableModificationServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedModificationServices.includes(service.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedModificationServices.includes(service.id)}
                                onChange={() => handleServiceToggle(service.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1 ml-6">{service.description}</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-500 mt-2 ml-6">
                              {service.estimatedCost && (
                                <span>Est. Cost: ${service.estimatedCost}</span>
                              )}
                              {service.estimatedHours && (
                                <span>Est. Time: {service.estimatedHours} hrs</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No modification services available. Please contact admin.</p>
                )}
                <div>
                  <label htmlFor="modifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Modifications (Optional)
                  </label>
                  <textarea
                    id="modifications"
                    value={modifications}
                    onChange={(e) => setModifications(e.target.value)}
                    placeholder="e.g., Custom paint job, Special wiring, etc. (comma-separated)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add any additional modifications not listed above (comma-separated)
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/consumer-dashboard")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Booking..." : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>

        {/* Booking Summary (if date and slot selected) */}
        {(selectedDate || selectedSlotId) && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type:</span>
                <span className="font-medium">{serviceType}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {selectedTimeSlot && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </span>
                </div>
              )}
              {vehicle && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{vehicle}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



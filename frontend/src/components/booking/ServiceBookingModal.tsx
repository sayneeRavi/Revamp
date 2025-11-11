"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PaymentModal from "@/components/booking/PaymentModal";
import { checkAvailability, createAppointment, createPaymentIntent } from "@/lib/api";
import type { TimeSlot } from "@/types/booking";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

interface ServiceBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registeredVehicles: Vehicle[];
}

export default function ServiceBookingModal({
  open,
  onOpenChange,
  registeredVehicles,
}: ServiceBookingModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("");
  const [otherVehicleDetails, setOtherVehicleDetails] = useState({
    make: "",
    model: "",
    year: "",
    registrationNumber: "",
  });
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [serviceAmount] = useState(5000); // Fixed service amount in LKR

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSelectedTimeSlotId("");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await checkAvailability(selectedDate);
        if (!cancelled) setSlots(data.filter((s) => s.isAvailable));
      } catch (e) {
        if (!cancelled) setSlots([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const handleOpenPayment = async () => {
    setLoading(true);
    try {
      // Create appointment first
      const body = {
        serviceType: "Service" as const,
        date: selectedDate,
        timeSlotId: selectedTimeSlotId,
        instructions: remarks,
        ...(selectedVehicle !== "other"
          ? { vehicleId: selectedVehicle }
          : {
              vehicleDetails: {
                make: otherVehicleDetails.make,
                model: otherVehicleDetails.model,
                year: Number(otherVehicleDetails.year),
                registrationNumber: otherVehicleDetails.registrationNumber,
              },
            }),
      };
      const appointment = await createAppointment(body);
      setBookingId(appointment.id);

      // Create payment intent
      const payment = await createPaymentIntent(appointment.id, serviceAmount);
      setClientSecret(payment.clientSecret);
      setPaymentOpen(true);
    } catch (e) {
      alert("Failed to create booking: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const afterPayment = async (payload: { method: "card" | "cash"; paymentIntentId?: string }) => {
    alert(`Booking confirmed! ${payload.method === "card" ? "Payment processed." : "Cash payment will be collected on admission."}`);
    onOpenChange(false);
    setPaymentOpen(false);
    // reset
    setSelectedVehicle("");
    setSelectedDate("");
    setSelectedTimeSlotId("");
    setOtherVehicleDetails({ make: "", model: "", year: "", registrationNumber: "" });
    setRemarks("");
    setClientSecret(undefined);
    setBookingId(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Service</DialogTitle>
          <DialogDescription>
            Select your vehicle, preferred date and time slot for service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vehicle Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Vehicle</Label>
            <RadioGroup
              value={selectedVehicle}
              onValueChange={setSelectedVehicle}
            >
              {registeredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={vehicle.id} id={vehicle.id} />
                  <Label
                    htmlFor={vehicle.id}
                    className="cursor-pointer font-normal"
                  >
                    {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.registrationNumber}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer font-normal">
                  Other Vehicle
                </Label>
              </div>
            </RadioGroup>

            {/* Other Vehicle Details */}
            {selectedVehicle === "other" && (
              <div className="ml-6 space-y-3 border-l-2 border-[#00F9FF] pl-4 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="Toyota"
                      value={otherVehicleDetails.make}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          make: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="Camry"
                      value={otherVehicleDetails.model}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          model: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2020"
                      value={otherVehicleDetails.year}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          year: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg">Registration Number</Label>
                    <Input
                      id="reg"
                      placeholder="ABC-1234"
                      value={otherVehicleDetails.registrationNumber}
                      onChange={(e) =>
                        setOtherVehicleDetails({
                          ...otherVehicleDetails,
                          registrationNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label htmlFor="date" className="text-base font-semibold">
              Select Date
            </Label>
            <Input
              id="date"
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Available Time Slots</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={selectedTimeSlotId === slot.id ? "default" : "outline"}
                    onClick={() => setSelectedTimeSlotId(slot.id)}
                    className={
                      selectedTimeSlotId === slot.id
                        ? "bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]"
                        : ""
                    }
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                ))}
                {slots.length === 0 && (
                  <div className="text-sm text-gray-500">No slots available for the selected date.</div>
                )}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-semibold">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Any specific requirements or issues with your vehicle..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleOpenPayment}
            disabled={
              !selectedVehicle ||
              !selectedDate ||
              !selectedTimeSlotId ||
              (selectedVehicle === "other" &&
                (!otherVehicleDetails.make ||
                  !otherVehicleDetails.model ||
                  !otherVehicleDetails.year ||
                  !otherVehicleDetails.registrationNumber)) ||
              loading
            }
            className="bg-[#00F9FF] text-[#0A0A0B] hover:bg-[#4CC9F4]"
          >
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={serviceAmount}
        clientSecret={clientSecret}
        onConfirm={afterPayment}
      />
    </Dialog>
  );
}


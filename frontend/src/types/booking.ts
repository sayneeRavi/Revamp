export type ServiceType = "Service" | "Modification";

export interface TimeSlot {
  id: string;
  startTime: string; // ISO time or HH:mm
  endTime: string;   // ISO time or HH:mm
  isAvailable: boolean;
}

export interface AppointmentRequest {
  serviceType: ServiceType;
  date: string; // yyyy-MM-dd
  timeSlotId?: string; // required for Service
  vehicleId?: string; // existing vehicle
  vehicleDetails?: {
    make: string;
    model: string;
    year: string | number;
    registrationNumber: string;
  };
  neededModifications?: string[]; // ids for Modification flow
  estimatedTimeHours?: number;
  estimatedCost?: number;
  instructions?: string;
}

export interface AppointmentResponse {
  id: string;
  status: "pending" | "approved" | "in_progress" | "completed";
}

export interface ModificationItem {
  id: string;
  name: string;
  estimatedHours: number;
  unitPrice?: number;
  description?: string;
}

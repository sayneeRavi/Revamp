export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
}

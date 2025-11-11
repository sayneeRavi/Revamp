export const AUTH_BASE =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8081";

export const CUSTOMER_BASE =
  process.env.NEXT_PUBLIC_CUSTOMER_URL || "http://localhost:8082";

// Generic fetch with token + JSON handling
function makeApi(base: string) {
  return async function api(path: string, options: RequestInit = {}) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      if (typeof window !== "undefined") {
        console.log("[FE] attaching auth", `Bearer ${token.slice(0, 20)}...`);
      }
    }

    const res = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: "omit",
    });

    if (res.status === 204) return null;

    const text = await res.text().catch(() => "");
    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");

    if (res.ok) return isJson && text ? JSON.parse(text) : text;

    // Force relogin on 401/403 (and 500 from auth'd calls)
    const shouldForceRelogin = res.status === 401 || res.status === 403;

    if (shouldForceRelogin) {
      try { localStorage.removeItem("token"); } catch {}
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=sessionExpired";
      }
    }

    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  };
}

// Use these in your pages/components:
export const authApi = makeApi(AUTH_BASE);
export const customerApi = makeApi(CUSTOMER_BASE);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
const TIMESLOT_API_BASE = process.env.NEXT_PUBLIC_TIMESLOT_API_BASE || API_BASE;
const CUSTOMER_API_BASE = process.env.NEXT_PUBLIC_CUSTOMER_API_BASE || API_BASE;

function getAuthHeaders() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Vehicles
import type { Vehicle, CreateVehicleRequest } from "@/types/vehicle";
export function listVehicles(customerId: string) {
  return apiFetch<Vehicle[]>(`${CUSTOMER_API_BASE}/api/customers/${customerId}/vehicles`);
}
export function createVehicle(customerId: string, body: CreateVehicleRequest) {
  return apiFetch<Vehicle>(`${CUSTOMER_API_BASE}/api/customers/${customerId}/vehicles`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Timeslots
import type { TimeSlot, AppointmentRequest, AppointmentResponse, ModificationItem } from "@/types/booking";
export function checkAvailability(date: string) {
  return apiFetch<TimeSlot[]>(`${TIMESLOT_API_BASE}/api/bookings/timeslots/check-availability/${date}`);
}

// Appointments
export function createAppointment(body: AppointmentRequest) {
  return apiFetch<AppointmentResponse>(`${API_BASE}/api/bookings/appointments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Modifications catalog
export function listModificationItems() {
  return apiFetch<ModificationItem[]>(`${API_BASE}/api/modifications`);
}

// Payment
export function createPaymentIntent(bookingId: string, amount?: number) {
  return apiFetch<{ clientSecret: string; paymentIntentId: string }>(
    `${API_BASE}/api/bookings/${bookingId}/payment-intent`,
    {
      method: "POST",
      body: JSON.stringify({ amount }),
    }
  );
}
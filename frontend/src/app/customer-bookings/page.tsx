"use client";
import SidebarLayout from "@/components/SidebarLayout";
import ConfirmationPopup from "@/components/ConfirmationPopup";
import { useEffect, useState } from "react";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

type Booking = {
  id?: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  serviceType: string;
  vehicleId?: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    plateNo?: string;
  };
  notes?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<string | null>(null);

  async function fetchBookings() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${GATEWAY_URL}/api/bookings`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load bookings: ${response.statusText}`);
      }
      
      const list = await response.json();
      setBookings(list || []);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setMessage({ type: "error", text: "Failed to load bookings." });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(bookingId?: string) {
    if (!bookingId) return;
    setDeleteBooking(bookingId);
  }

  async function confirmDelete() {
    if (!deleteBooking) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${GATEWAY_URL}/api/bookings/${deleteBooking}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.statusText}`);
      }
      
      setMessage({ type: "success", text: "Booking deleted successfully!" });
      await fetchBookings();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete booking." });
    } finally {
      setDeleteBooking(null);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        {/* 🧩 Box 1: Header Section */}
        <header className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                My Bookings
              </h1>
              <p className="text-gray-500">
                View and manage all your service bookings
              </p>
            </div>
            <button
              onClick={() => {
                /* TODO: Open Add Booking Modal */
              }}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              + New Booking
            </button>
          </div>
        </header>

        {/* 🧩 Box 2: Booking List Section */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all">
          {/* ✅ Feedback popup */}
          {message && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-600 py-10">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600 bg-gray-50">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-lg font-semibold">No bookings found</p>
              <p className="text-sm text-gray-500 mt-1">
                Add your first booking using the button above
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {b.serviceType}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {b.vehicleDetails?.make} {b.vehicleDetails?.model} •{" "}
                        {b.vehicleDetails?.plateNo}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(b.date).toLocaleDateString()}
                      </p>
                      {b.notes && (
                        <p className="mt-1 text-sm text-gray-500">{b.notes}</p>
                      )}
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.status === "confirmed"
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : b.status === "completed"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : b.status === "cancelled"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-end space-x-3 mt-3">
                    <button
                      onClick={() => {
                        /* TODO: Edit Booking */
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 🧩 Delete Confirmation Popup */}
        <ConfirmationPopup
          isOpen={deleteBooking !== null}
          onClose={() => setDeleteBooking(null)}
          onConfirm={confirmDelete}
          title="Delete Booking"
          message="Are you sure you want to delete this booking? This action cannot be undone."
          confirmButtonText="Yes, delete booking"
        />
      </div>
    </SidebarLayout>
  );
}

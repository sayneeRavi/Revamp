"use client";
import SidebarLayout from "@/components/SidebarLayout";
import AddVehicleForm from "@/components/AddVehicleForm";
import ConfirmationPopup from "@/components/ConfirmationPopup";
import { customerApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Vehicle = {
  id?: string;
  make?: string;
  model?: string;
  plateNo?: string;
  year?: number;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<string | null>(null);

  async function fetchVehicles() {
    try {
      setLoading(true);
      const list = await customerApi("/api/vehicles");
      setVehicles(list || []);
    } catch (err) {
      console.error("Failed to load vehicles", err);
      setMessage({ type: "error", text: "Failed to load vehicles." });
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(vehicleId?: string) {
    if (!vehicleId) return;
    setDeleteVehicle(vehicleId);
  }

  async function confirmDelete() {
    if (!deleteVehicle) return;
    try {
      await customerApi(`/api/vehicles/${deleteVehicle}`, { method: "DELETE" });
      setMessage({ type: "success", text: "Vehicle deleted successfully!" });
      await fetchVehicles();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete vehicle." });
    } finally {
      setDeleteVehicle(null);
    }
  }

  async function saveEditedVehicle() {
    if (!editingVehicle) return;
    const rawId = editingVehicle.id ?? "";
    const id = rawId.replace(/\.+$/, "");
    if (!id) {
      setMessage({ type: "error", text: "Invalid vehicle id" });
      return;
    }

    try {
      console.log("[Vehicles] PUT", `/api/vehicles/${id}`, editingVehicle);
      await customerApi(`/api/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          make: editingVehicle.make,
          model: editingVehicle.model,
          plateNo: editingVehicle.plateNo,
          year: editingVehicle.year,
        }),
      });
      setMessage({ type: "success", text: "Vehicle updated successfully!" });
      setEditingVehicle(null);
      await fetchVehicles();
    } catch (err: any) {
      console.error("Failed to update vehicle", err);
      setMessage({
        type: "error",
        text: err?.message ?? "Failed to update vehicle.",
      });
    }
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        {/* 🧩 Box 1: Header Section */}
        <header className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                My Vehicles
              </h1>
              <p className="text-gray-500">
                Manage your registered vehicles here
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              + Add Vehicle
            </button>
          </div>
        </header>

        {/* 🧩 Box 2: Vehicle List Section */}
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
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600 bg-gray-50">
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-lg font-semibold">No vehicles found</p>
              <p className="text-sm text-gray-500 mt-1">
                Add your first vehicle using the button above
              </p>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <li
                  key={v.id}
                  className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition relative"
                >
                  {editingVehicle && editingVehicle.id === v.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingVehicle.make ?? ""}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            make: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Make"
                      />
                      <input
                        type="text"
                        value={editingVehicle.model ?? ""}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            model: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Model"
                      />
                      <input
                        type="text"
                        value={editingVehicle.plateNo ?? ""}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            plateNo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Plate Number"
                      />
                      <input
                        type="number"
                        value={editingVehicle.year ?? ""}
                        onChange={(e) =>
                          setEditingVehicle({
                            ...editingVehicle,
                            year: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Year"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setEditingVehicle(null)}
                          className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedVehicle}
                          className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {v.make} {v.model}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {v.plateNo}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full ring-1 ring-gray-200 bg-gray-50">
                          {v.year ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-end space-x-3 mt-3">
                        <button
                          onClick={() => setEditingVehicle(v)}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add Vehicle Form */}
        {showAdd && (
          <AddVehicleForm
            onClose={() => setShowAdd(false)}
            onSuccess={async () => {
              await fetchVehicles();
              setShowAdd(false);
              setMessage({
                type: "success",
                text: "Vehicle added successfully!",
              });
            }}
          />
        )}

        {/* Delete Confirmation Popup */}
        <ConfirmationPopup
          isOpen={deleteVehicle !== null}
          onClose={() => setDeleteVehicle(null)}
          onConfirm={confirmDelete}
          title="Delete Vehicle"
          message="Are you sure you want to delete this vehicle? This action cannot be undone."
          confirmButtonText="Yes, delete vehicle"
        />
      </div>
    </SidebarLayout>
  );
}

"use client";
import React, { useState } from "react";
import { customerApi } from "@/lib/api";

type Props = {
  onClose: () => void;
  onSuccess: (v: any) => void;
};

export default function AddVehicleForm({ onClose, onSuccess }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: any = { make, model, plateNo };
      if (year !== "") payload.year = Number(year);

      const saved = await customerApi("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-3">Add vehicle</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Plate number</label>
            <input
              value={plateNo}
              onChange={(e) => setPlateNo(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Year</label>
            <input
              value={year}
              onChange={(e) =>
                setYear(e.target.value === "" ? "" : Number(e.target.value))
              }
              type="number"
              min={1900}
              max={2100}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white"
          >
            {loading ? "Saving..." : "Save vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}

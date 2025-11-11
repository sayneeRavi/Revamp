"use client";
import SidebarLayout from "@/components/SidebarLayout";
import { customerApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Vehicle = {
  id?: string;
  make?: string;
  model?: string;
  plateNo?: string;
  year?: number;
};
type Item = {
  id?: string;
  title: string;
  status: string;
  completedAt?: string;
  cost?: number;
  vehicleId?: string;
  vehicle?: { plateNo?: string; make?: string; model?: string };
};

// 🎨 Soft, modern color system aligned with your dashboard
const PALETTE = {
  primary: "#1E293B",
  cyan: "#06B6D4",
  success: "#22C55E",
  danger: "#EF4444",
  info: "#3B82F6",
  secondary: "#64748B",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  accent: "#6366F1",
};

// 💬 Status badge for visual clarity
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    OPEN: { bg: "bg-blue-100 text-blue-800" },
    IN_PROGRESS: { bg: "bg-yellow-100 text-yellow-800" },
    DONE: { bg: "bg-green-100 text-green-800" },
    CANCELLED: { bg: "bg-red-100 text-red-800" },
  };
  const colors = map[status] || map.OPEN;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.color}`}
    >
      <span className="h-1.5 w-1.5 mr-1.5 rounded-full bg-current" />
      {status.replace("_", " ")}
    </span>
  );
}

export default function HistoryPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [vehiclesRes, histRes] = await Promise.all([
          customerApi("/api/vehicles"),
          customerApi("/api/history"),
        ]);

        const vehicles: Vehicle[] = Array.isArray(vehiclesRes)
          ? vehiclesRes
          : [];
        const vmap = new Map<string, Vehicle>();
        vehicles.forEach((v) => {
          if (v.id) vmap.set(v.id, v);
        });

        const list: Item[] = Array.isArray(histRes) ? histRes : [];
        list.forEach((h) => {
          if (!h.vehicle && h.vehicleId && vmap.has(h.vehicleId)) {
            const v = vmap.get(h.vehicleId)!;
            h.vehicle = { make: v.make, model: v.model, plateNo: v.plateNo };
          }
        });

        list.sort((a, b) =>
          (b.completedAt || "").localeCompare(a.completedAt || "")
        );
        setRows(list);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: PALETTE.cyan,
                borderTopColor: "transparent",
              }}
            ></div>
            <p className="text-gray-700 font-medium">
              Loading your service history...
            </p>
            <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        {/* 📋 Header Section */}
        <header className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Service History
              </h1>
              <p className="text-gray-500">
                Track all your completed and ongoing vehicle services
              </p>
            </div>
          </div>
        </header>

        {/* 📊 Service Table Section */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                All Service Records
              </h2>
              <p className="text-sm text-gray-500">
                Review your complete service history below
              </p>
            </div>
            <span className="px-4 py-2 bg-cyan-100 text-cyan-800 text-sm font-semibold rounded-full">
              {rows.length} Records
            </span>
          </div>

          {rows.length === 0 ? (
            <div className="text-center border-2 border-dashed border-gray-300 rounded-2xl p-10 text-gray-600 bg-gray-50">
              <p className="text-lg font-semibold">No service history found</p>
              <p className="text-sm text-gray-500 mt-1">
                Your records will appear once your first service is completed
              </p>
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-4 font-semibold text-left">Status</th>
                    <th className="p-4 font-semibold text-left">Date</th>
                    <th className="p-4 font-semibold text-left">
                      Service Title
                    </th>
                    <th className="p-4 font-semibold text-left">Vehicle</th>
                    <th className="p-4 font-semibold text-right">Cost (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.id ?? i}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="p-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="p-4 text-gray-700">
                        {r.completedAt
                          ? new Date(r.completedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "—"}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {r.title}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {r.vehicle?.make} {r.vehicle?.model}
                            </p>
                            {r.vehicle?.plateNo && (
                              <p className="text-xs text-gray-500 mt-1">
                                {r.vehicle.plateNo}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {typeof r.cost === "number" ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm">
                            Rs. {r.cost.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <p>
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {rows.length}
                </span>{" "}
                records
              </p>
              <p>
                Total spent:{" "}
                <span className="font-semibold text-gray-900">
                  Rs.{" "}
                  {rows
                    .reduce((sum, r) => sum + (r.cost || 0), 0)
                    .toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </section>
      </div>
    </SidebarLayout>
  );
}

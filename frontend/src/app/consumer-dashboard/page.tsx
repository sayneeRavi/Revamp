"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { customerApi } from "@/lib/api";
import { decodeToken } from "@/utils/jwt";

// -------- Types
type Vehicle = {
  id?: string;
  customerUserId?: string;
  make?: string;
  model?: string;
  plateNo?: string;
  year?: number;
};
type HistoryItem = {
  id?: string;
  vehicleId?: string;
  title: string;
  status?: string;
  completedAt?: string | null;
  cost?: number;
  vehicle?: { plateNo?: string; make?: string; model?: string };
};

// ------- Palette
const PALETTE = {
  primary: "#0A0A0B",
  cyan: "#00F9FF",
  success: "#3DDC97",
  danger: "#E63946",
  info: "#4CC9F0",
  secondary: "#3E92CC",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  accent: "#6366F1",
  lightCyan: "#E6FFFF",
  lightBlue: "#E6F7FF",
  lightGreen: "#E8F8F2",
  lightRed: "#FFEBEE",
  lightPurple: "#F3F4FF",
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}
function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ---------- UI bits (unchanged visuals)
function StatCard({
  title,
  value,
  hint,
  emoji,
  color,
  delay = 0,
}: {
  title: string;
  value: string;
  hint?: string;
  emoji?: string;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group relative overflow-hidden border"
      style={{
        animationDelay: `${delay}ms`,
        background: `
          linear-gradient(145deg, ${rgba(color, 0.96)} 0%, ${rgba(
          color,
          0.82
        )} 100%),
          linear-gradient(180deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.08) 100%)
        `,
        color: "#FFFFFF",
        borderColor: "rgba(255,255,255,0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: `0 12px 28px ${rgba(
          color,
          0.35
        )}, inset 0 1px 0 rgba(255,255,255,0.32)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px 200px at 80% -20%, rgba(255,255,255,.22), transparent)`,
        }}
      />
      <div className="absolute top-0 -left-1/2 w-1/2 h-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[150%] transition-all duration-1000" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white/95">{title}</span>
          {emoji && (
            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
              {emoji}
            </span>
          )}
        </div>
        <div className="text-4xl font-extrabold mb-2 transform group-hover:scale-105 transition-transform duration-300">
          {value}
        </div>
        {hint && (
          <div className="text-xs text-white/95 bg-white/15 rounded-lg px-2 py-1 inline-block border border-white/25">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { bg: string; text: string; glow: string }> = {
    OPEN: {
      bg: PALETTE.secondary,
      text: "white",
      glow: `${PALETTE.secondary}60`,
    },
    IN_PROGRESS: { bg: PALETTE.info, text: "white", glow: `${PALETTE.info}60` },
    DONE: { bg: PALETTE.success, text: "white", glow: `${PALETTE.success}60` },
    CANCELLED: {
      bg: PALETTE.danger,
      text: "white",
      glow: `${PALETTE.danger}60`,
    },
  };
  const key = (status ?? "").toUpperCase().trim();
  const s = m[key] ?? m.OPEN;
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-300"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        boxShadow: `0 4px 20px 0 ${s.glow}`,
      }}
    >
      <span className="h-2 w-2 rounded-full bg-white/90" />
      {key.replace("_", " ")}
    </span>
  );
}
function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <div
      className="rounded-2xl p-6 hover:scale-102 transition-all duration-500 hover:shadow-xl group cursor-pointer border border-blue-200 bg-white"
      style={{
        animationDelay: `${index * 100}ms`,
        background: `linear-gradient(135deg, ${PALETTE.lightBlue} 0%, ${PALETTE.lightCyan}80 100%)`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm transform group-hover:rotate-12 transition-transform duration-300 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.secondary}, ${PALETTE.info})`,
                boxShadow: `0 4px 20px 0 ${PALETTE.secondary}60`,
              }}
            ></div>
            <div>
              <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors duration-300">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {vehicle.year || "Year not specified"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-2 rounded-lg font-semibold text-sm border border-cyan-300 shadow-sm flex items-center gap-2"
              style={{
                backgroundColor: PALETTE.lightCyan,
                color: PALETTE.cyan,
              }}
            >
              <span></span>
              {vehicle.plateNo ?? "No plate"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
        <span className="text-xs text-gray-600 font-medium">
          Vehicle Status
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/80 text-gray-700 font-semibold">
          Active
        </span>
      </div>
    </div>
  );
}
function HistoryCard({ history }: { history: HistoryItem }) {
  return (
    <div
      className="rounded-2xl p-6 hover:scale-102 transition-all duration-500 hover:shadow-xl group border border-green-200 bg-white"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.lightGreen} 0%, ${PALETTE.lightCyan}80 100%)`,
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg transform group-hover:rotate-12 transition-transform duration-300 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${PALETTE.success}, ${PALETTE.cyan})`,
            boxShadow: `0 4px 20px 0 ${PALETTE.success}60`,
          }}
        ></div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">Latest Service</h3>
          <p className="text-sm text-gray-600 mt-1">
            Most recent service record
          </p>
        </div>
        <StatusBadge status={(history.status ?? "").toString()} />
      </div>

      <div className="space-y-4">
        <div className="bg-white/80 rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: PALETTE.secondary }}
            >
              <span></span> Service
            </span>
            <span className="font-bold text-gray-900 text-right text-sm">
              {history.title}
            </span>
          </div>
        </div>

        <div className="bg-white/80 rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: PALETTE.secondary }}
            >
              <span></span> Vehicle
            </span>
            <span className="font-bold text-gray-900 text-right text-sm">
              {history.vehicle?.make} {history.vehicle?.model}
              {history.vehicle?.plateNo && ` • ${history.vehicle.plateNo}`}
            </span>
          </div>
        </div>

        {!!history.completedAt && (
          <div className="bg-white/80 rounded-xl p-4 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: PALETTE.secondary }}
              >
                <span></span> Date
              </span>
              <span className="font-bold text-gray-900 text-sm">
                {new Date(history.completedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {typeof history.cost === "number" && (
          <div className="bg-gradient-to-r from-green-100 to-cyan-100 rounded-xl p-4 border border-green-200 shadow-sm mt-2">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: PALETTE.cyan }}
              >
                <span></span> Total Cost
              </span>
              <span className="text-xl font-bold text-gray-900">
                Rs. {history.cost.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function greetNow() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

// ---------- Page
export default function CustomerDashboard() {
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
  } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ✅ Completed count is computed from FULL history
  const stats = useMemo(() => {
    const norm = (s?: string) => (s ?? "").toString().trim().toUpperCase();
    const isDone = (h: HistoryItem) =>
      norm(h.status) === "DONE" ||
      !!(h.completedAt && h.completedAt !== "null" && h.completedAt !== "");
    const completed = history.filter(isDone).length;

    const inactive = (h: HistoryItem) =>
      norm(h.status) === "DONE" ||
      norm(h.status) === "CANCELLED" ||
      !!h.completedAt;
    const active = history.filter((h) => !inactive(h)).length;

    return { active, completed };
  }, [history]);

  // Newest record for the card
  const latestHistory = history[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = decodeToken(token);
      setUser({ username: decoded?.username, email: decoded?.email });
    }

    (async () => {
      // Try to fetch the customer profile and prefer its name over token username
      try {
        const me = await customerApi("/api/customers/me");
        if (me) {
          setUser((u) => ({
            ...(u ?? {}),
            username: me.name ?? u?.username,
            email: me.email ?? u?.email,
          }));
        }
      } catch (e) {
        // ignore - fall back to token
      }

      try {
        const [vRes, hRes] = await Promise.all([
          customerApi("/api/vehicles"),
          customerApi("/api/history"),
        ]);

        const vehiclesList: Vehicle[] = Array.isArray(vRes)
          ? vRes
          : vRes?.content ?? vRes?.items ?? [];
        const historyRaw: HistoryItem[] = Array.isArray(hRes)
          ? hRes
          : hRes?.content ?? hRes?.items ?? [];

        // Map of vehicles
        const vmap = new Map<string, Vehicle>();
        vehiclesList.forEach((v) => {
          if (v?.id) vmap.set(v.id, v);
        });
        setVehicles(vehiclesList);

        // Enrich + normalize statuses
        const enriched = historyRaw.map((h) => {
          const vehicle =
            !h.vehicle && h.vehicleId && vmap.has(h.vehicleId)
              ? (() => {
                  const v = vmap.get(h.vehicleId)!;
                  return { make: v.make, model: v.model, plateNo: v.plateNo };
                })()
              : h.vehicle;

          const normalizedStatus = (h.status ?? "")
            .toString()
            .trim()
            .toUpperCase();
          return { ...h, vehicle, status: normalizedStatus };
        });

        // Debug once: see distinct statuses coming from API
        const uniq = Array.from(new Set(enriched.map((h) => h.status ?? "")));
        // eslint-disable-next-line no-console
        console.debug("[Dashboard] distinct statuses:", uniq);

        // Sort newest first by completedAt (falls back to title to keep order stable)
        enriched.sort((a, b) => {
          const A = a.completedAt || "";
          const B = b.completedAt || "";
          if (A !== B) return B.localeCompare(A);
          return (b.title || "").localeCompare(a.title || "");
        });

        setHistory(enriched);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-6"
              style={{
                borderColor: PALETTE.cyan,
                borderTopColor: "transparent",
              }}
            />
            <div className="text-gray-700 text-lg font-semibold">
              Loading your dashboard...
            </div>
            <div className="text-cyan-600 text-sm mt-2">
              Preparing something amazing
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (err) {
    return (
      <SidebarLayout>
        <div className="rounded-2xl p-6 border border-red-300" style={{}}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white"
              style={{ backgroundColor: PALETTE.danger }}
            ></div>
            <div>
              <div className="font-bold text-gray-900 text-lg">
                Error loading data
              </div>
              <div className="text-red-600 text-sm mt-1">{err}</div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-white p-6">
        {/* Header */}
        <div
          className="rounded-2xl p-8 mb-8 hover:shadow-xl transition-all duration-500 border border-cyan-300"
          style={{
            background: `linear-gradient(135deg, ${PALETTE.lightBlue} 0%, ${PALETTE.lightCyan} 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-cyan-700 text-sm font-semibold mb-2 tracking-wider">
                {user?.email ?? ""}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">{`Good ${greetNow()}, ${
                user?.username ?? "Customer"
              }!`}</h2>
              <p className="text-gray-700 text-lg">
                Welcome to your premium vehicle service dashboard
              </p>
            </div>
          </div>
        </div>

        {/* KPIs (now correct) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Jobs"
            value={String(stats.active)}
            hint="Currently in progress"
            color={PALETTE.secondary}
            delay={0}
          />
          <StatCard
            title="Completed"
            value={String(stats.completed)}
            hint="Successfully done"
            color={PALETTE.success}
            delay={200}
          />
          <StatCard
            title="Total Vehicles"
            value={String(vehicles.length)}
            hint="Registered vehicles"
            color={PALETTE.info}
            delay={400}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Vehicles */}
          <section className="xl:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div></div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      My Vehicles
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage your registered vehicles
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold text-white px-4 py-2 rounded-full shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.secondary}, ${PALETTE.info})`,
                    boxShadow: `0 4px 20px 0 ${PALETTE.secondary}60`,
                  }}
                >
                  {vehicles.length} vehicles
                </span>
              </div>

              {vehicles.length === 0 ? (
                <div>
                  <div className="text-5xl mb-4"></div>
                  <div className="font-bold text-gray-700 text-xl mb-2">
                    No vehicles found
                  </div>
                  <div className="text-gray-600">
                    Add your first vehicle to get started
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {vehicles.map((v, index) => (
                    <VehicleCard
                      key={v.id ?? `${v.make}-${v.model}-${index}`}
                      vehicle={v}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Service */}
          <section className="xl:col-span-1">
            <div
              className="rounded-2xl p-6 hover:shadow-xl transition-all duration-500 border border-green-300 h-full"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.lightGreen} 0%, ${PALETTE.lightCyan}80 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Recent Service
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Latest service record
                    </p>
                  </div>
                </div>
              </div>

              {latestHistory ? (
                <HistoryCard history={latestHistory} />
              ) : (
                <div
                  className="rounded-2xl border-2 border-dashed border-green-300 p-8 text-center text-gray-600 hover:border-green-500 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.lightGreen}50, ${PALETTE.lightCyan}50)`,
                  }}
                >
                  <div className="text-4xl mb-4"></div>
                  <div className="font-bold text-gray-700 text-lg mb-2">
                    No service history
                  </div>
                  <div className="text-gray-600 text-sm">
                    Your service records will appear here
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
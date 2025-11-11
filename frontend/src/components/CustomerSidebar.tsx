"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ConfirmationPopup from "./ConfirmationPopup";

// Theme palette (matches your dashboard)
export const PALETTE = {
  ink: "#0A0A0B", // primary text
  cyan: "#00F9FF", // accent
  mint: "#3DDC97", // success
  red: "#E63946", // danger
  sky: "#4CC9F0", // info
  blue: "#3E92CC", // secondary
  // soft tints
  softBlue: "#F1F9FF",
  softMint: "#F2FCF8",
  softRing: "#E9EEF5",
};

type Item = { href: string; label: string };

const items: Item[] = [
  { href: "/consumer-dashboard", label: "Home" },
  { href: "/customer-bookings", label: "My Bookings" },
  { href: "/customer-vehicles", label: "My Vehicles" },
  { href: "/customer-history", label: "History" },
  { href: "/customer-profile", label: "My Profile" },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  const [isPopupOpen, setPopupOpen] = useState(false);

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-64 md:shrink-0 min-h-screen border-r bg-white"
      style={{ borderColor: PALETTE.softRing }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 font-semibold text-white tracking-wide flex items-center gap-3 sticky top-0 z-10"
        style={{
          background: `linear-gradient(90deg, ${PALETTE.blue} 0%, ${PALETTE.sky} 100%)`,
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        Revamp • Customer
      </div>

      {/* Navigation links with improved spacing */}
      <nav className="px-4 py-6 space-y-3">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                "transition-all duration-300 ease-out will-change-transform",
                active ? "text-white" : "text-gray-700 hover:text-gray-900",
              ].join(" ")}
              style={
                active
                  ? {
                      background: `linear-gradient(90deg, ${PALETTE.blue} 0%, ${PALETTE.sky} 100%)`,
                      boxShadow:
                        "0 6px 20px rgba(62,146,204,.25), inset 0 1px 0 rgba(255,255,255,.25)",
                      border: "1px solid rgba(255,255,255,.35)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      transform: "translateY(-1px)",
                    }
                  : {
                      background: "rgba(241,249,255,.8)", // softBlue with transparency
                      boxShadow: "inset 0 0 0 1px " + PALETTE.softRing,
                      border: "1px solid " + PALETTE.softRing,
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }
              }
            >
              {/* Accent bar for active link */}
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full"
                style={{
                  background: active ? "rgba(255,255,255,.9)" : "transparent",
                }}
              />
              <span className="truncate">{it.label}</span>

              {/* Hover glass sheen */}
              <span
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0))",
                }}
              />
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <button
        onClick={() => setPopupOpen(true)}
        className="mt-auto mb-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>

      <ConfirmationPopup
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmButtonText="Yes, log out"
        onConfirm={() => {
          // End session (clear client-side tokens/storage) and redirect to login page
          try {
            localStorage.removeItem("token");
            // clear any other client-side session storage if used
            sessionStorage.clear();
          } catch (e) {
            // ignore if storage is unavailable
          }
          setPopupOpen(false);
          window.location.href = "/login";
        }}
      />

      <div className="h-4" />
    </aside>
  );
}

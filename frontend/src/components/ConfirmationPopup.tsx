"use client";

import React, { useEffect } from "react";

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmButtonText?: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmButtonText = "Yes, continue",
}) => {
  // close on Escape key for usability
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-hidden={!isOpen}
      aria-modal={true}
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Translucent overlay that lets the underlying UI show through; not a solid black backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: "rgba(255,255,255,0.55)", // light translucent wash (not black)
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)",
        }}
      />

      <div
        className="relative w-full max-w-md mx-4"
        style={{ transform: "translateY(0)", zIndex: 60 }}
      >
        <div className="bg-white p-6 rounded-2xl shadow-2xl ring-1 ring-black/6">
          <h2 className="text-lg font-bold mb-3">{title}</h2>
          <p className="text-sm text-gray-700">{message}</p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;

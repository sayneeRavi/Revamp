import CustomerSidebar, { PALETTE } from "@/components/CustomerSidebar";
import React from "react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />

      <main className="flex-1">
        

        <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

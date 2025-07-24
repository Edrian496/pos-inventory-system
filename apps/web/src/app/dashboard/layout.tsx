"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Sidebar (fixed or absolute) */}
      <Sidebar />

      {/* Main layout container with responsive left padding */}
      <div className="md:pl-64 min-h-screen">
        <Header />

        <main className="p-4 pt-20 md:pt-6">{children}</main>
      </div>
    </div>
  );
}

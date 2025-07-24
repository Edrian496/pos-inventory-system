"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Bell,
  User,
  DollarSign,
  ClipboardList,
  PieChart,
  Menu,
  X,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: PieChart },
  { name: "Order", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Sales", href: "/dashboard/sales", icon: DollarSign },
  { name: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { name: "Expenses", href: "/dashboard/expenses", icon: Bell },
  { name: "Menu", href: "/dashboard/menu", icon: ClipboardList },
  { name: "Account", href: "/dashboard/account", icon: User },
];

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/signin";
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavLinks = () =>
    navItems.map(({ name, href, icon: Icon }) => {
      const isActive = pathname === href;
      return (
        <Link
          key={name}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition text-sm ${
            isActive
              ? "bg-indigo-100 text-indigo-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Icon size={20} />
          {name}
        </Link>
      );
    });

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white shadow">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-indigo-600">Ken's Resto</h2>
        <div className="w-6" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed bg-white shadow-md p-6 z-30">
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-10">
            Ken's Resto
          </h2>
          <nav className="space-y-2">{renderNavLinks()}</nav>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar Drawer */}
          <div className="relative w-64 bg-white h-full shadow-lg p-6 z-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-indigo-600">
                  Ken's Resto
                </h2>
                <button onClick={() => setMobileOpen(false)}>
                  <X />
                </button>
              </div>
              <nav className="space-y-2">{renderNavLinks()}</nav>
            </div>

            {/* Logout only shown in mobile sidebar */}
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-gray-100 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

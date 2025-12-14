"use client";

import { Search, Bell, Menu, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  "/admin-dashboard": ["Admin", "Dashboard"],
  "/admin-dashboard/users": ["Admin", "Manajemen User"],
  "/admin-dashboard/doctors": ["Admin", "Manajemen Dokter"],
  "/admin-dashboard/products": ["Admin", "Manajemen Produk"],
  "/admin-dashboard/facilities": ["Admin", "Manajemen Faskes"],
  "/admin-dashboard/transactions": ["Admin", "Transaksi"],
  "/admin-dashboard/settings": ["Admin", "Pengaturan"],
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const [adminName] = useState(() => {
    // Get admin name from localStorage
    const userStr = localStorage.getItem('glucoin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.full_name || "Admin";
      } catch {
        return "Admin";
      }
    }
    return "Admin";
  });
  const [notifications] = useState(3); // Mock notification count

  const breadcrumb = breadcrumbMap[pathname] || ["Admin", "Dashboard"];
  const initials = adminName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-6"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1 text-sm">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
              <span className={index === breadcrumb.length - 1 ? "text-gray-800 font-medium" : "text-gray-400"}>
                {item}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="h-10 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 md:hidden">
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="hidden lg:block h-8 w-px bg-gray-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-md">
            {initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-800">{adminName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

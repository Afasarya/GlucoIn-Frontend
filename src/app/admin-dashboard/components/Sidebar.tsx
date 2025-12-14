"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Package,
  Building2,
  CreditCard,
  ChevronUp,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-dashboard/users", label: "Manajemen User", icon: Users },
  { href: "/admin-dashboard/doctors", label: "Manajemen Dokter", icon: Stethoscope },
  { href: "/admin-dashboard/products", label: "Manajemen Produk", icon: Package },
  { href: "/admin-dashboard/facilities", label: "Manajemen Faskes", icon: Building2 },
  { href: "/admin-dashboard/transactions", label: "Transaksi", icon: CreditCard },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sidebar Content Component
function SidebarContent({ 
  pathname, 
  onClose, 
  isMobile = false 
}: { 
  pathname: string; 
  onClose: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-xl font-bold text-gray-800">Glucoin</span>
        </Link>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>
          <ChevronUp className="h-4 w-4 text-gray-400" />
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link, index) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin-dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <motion.div
                key={`${link.href}-${index}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => {
                    if (isMobile) onClose();
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1D7CF3] text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`}
                  />
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 p-4 space-y-1">
        <Link
          href="/admin-dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          Pengaturan
        </Link>
        <button
          onClick={() => {
            // Handle logout
            localStorage.removeItem('glucoin_token');
            localStorage.removeItem('glucoin_user');
            window.location.href = '/login';
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          Keluar
        </button>
      </div>

      {/* Decorative hexagon background */}
      <div className="relative h-24 overflow-hidden">
        <Image
          src="/images/assets/hexagon-bg.svg"
          alt=""
          fill
          className="object-cover opacity-30"
        />
      </div>
    </>
  );
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible on lg+ */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-gray-100 bg-white lg:flex">
        <SidebarContent pathname={pathname} onClose={onClose} />
      </aside>

      {/* Mobile Sidebar - Slide in/out */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-100 bg-white lg:hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent pathname={pathname} onClose={onClose} isMobile />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  MessageSquare,
  Mail,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { href: "/dokter-dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dokter-dashboard/pendapatan", label: "Pendapatan", icon: DollarSign },
  { href: "/dokter-dashboard/konsultasi", label: "Konsultasi", icon: MessageSquare },
  { href: "/dokter-dashboard/pesan", label: "Pesan", icon: Mail },
];

interface DokterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sidebar Content Component - defined outside main component
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
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="text-xl font-bold text-gray-800">
          LOGO
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2">
        <div className="mb-4 flex items-center justify-between px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dashboard
          </p>
          <ChevronUp className="h-4 w-4 text-gray-400" />
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link, index) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/dokter-dashboard" && pathname === "/dokter-dashboard");
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

      {/* Decorative hexagon background */}
      <div className="relative h-32 overflow-hidden">
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

export default function DokterSidebar({ isOpen, onClose }: DokterSidebarProps) {
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
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-gray-100 bg-white lg:flex">
        <SidebarContent pathname={pathname} onClose={onClose} />
      </aside>

      {/* Mobile Sidebar - Slide in/out */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-gray-100 bg-white lg:hidden"
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

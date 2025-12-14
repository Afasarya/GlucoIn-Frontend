"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  History,
  Target,
  Activity,
  FileText,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/deteksi-dini", label: "Deteksi Dini", icon: Search },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { href: "/dashboard/misi-harian", label: "Misi Harian", icon: Target },
  { href: "/dashboard/health-tracking", label: "Health Tracking", icon: Activity },
  { href: "/dashboard/analisis-lab", label: "Analisis Lab", icon: FileText },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-gray-100 bg-white"
    >
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <Link href="/">
          <Image
            src="/images/assets/logo.svg"
            alt="Glucoin Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
            priority
          />
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
            const isActive = pathname === link.href || 
              (link.href === "/dashboard" && pathname === "/dashboard");
            const Icon = link.icon;

            return (
              <motion.div
                key={link.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1D7CF3] text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
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
    </motion.aside>
  );
}

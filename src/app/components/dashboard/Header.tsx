"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  breadcrumb?: string[];
}

export default function DashboardHeader({ breadcrumb = ["Dashboard", "Overview"] }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-400">›</span>}
            <span className={index === breadcrumb.length - 1 ? "text-gray-800 font-medium" : "text-gray-400"}>
              {item}
            </span>
          </span>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
          <Search className="h-5 w-5" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
            HA
          </div>
          <span className="text-sm font-medium text-gray-800">Hanifa Akhilah</span>
        </div>
      </div>
    </motion.header>
  );
}

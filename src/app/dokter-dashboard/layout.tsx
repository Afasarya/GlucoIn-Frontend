"use client";

import DokterSidebar from "./components/Sidebar";
import DokterHeader from "./components/Header";
import { useState, useEffect } from "react";

export default function DokterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-show sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <DokterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="transition-all duration-300 lg:ml-[240px]">
        {/* Header */}
        <DokterHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import DashboardSidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="ml-[220px]">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types for data fetching
interface StatistikData {
  name: string;
  value: number;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  status: "Online" | "Offline";
}

interface DashboardStats {
  totalPasien: number;
  pendapatan: string;
  appointments: number;
}

// Default data - replace with API calls
const defaultStatistikData: StatistikData[] = [
  { name: "0", value: 95 },
  { name: "Jan", value: 100 },
  { name: "Feb", value: 115 },
  { name: "Mar", value: 95 },
  { name: "Apr", value: 90 },
  { name: "May", value: 100 },
  { name: "Jun", value: 95 },
  { name: "Jul", value: 120 },
  { name: "Aug", value: 130 },
  { name: "Sep", value: 145 },
  { name: "Oct", value: 130 },
  { name: "Nov", value: 90 },
  { name: "Dec", value: 85 },
];

const defaultAppointments: Appointment[] = [
  { id: "1", patientName: "Erna Handayani", time: "10.00 - 11.00", status: "Online" },
  { id: "2", patientName: "Erna Handayani", time: "10.00 - 11.00", status: "Online" },
  { id: "3", patientName: "Erna Handayani", time: "10.00 - 11.00", status: "Online" },
  { id: "4", patientName: "Erna Handayani", time: "10.00 - 11.00", status: "Online" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Stats Card Component
function StatsCard({
  value,
  label,
  className = "",
}: {
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 ${className}`}
      style={{
        backgroundImage: "url('/images/assets/pinkframe-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <p className="text-2xl font-bold text-gray-800 lg:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Statistik Chart Component
function StatistikChart({
  data,
  selectedPeriod,
  onPeriodChange,
}: {
  data: StatistikData[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const periods = ["Tahun ini", "Bulan ini", "Minggu ini"];

  return (
    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Statistik Jumlah Pasien
        </h3>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            {selectedPeriod}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    onPeriodChange(period);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    selectedPeriod === period
                      ? "bg-[#EEF8FF] text-[#1D7CF3]"
                      : "text-gray-600"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[280px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D7CF3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1D7CF3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              domain={[80, 160]}
              ticks={[100, 150]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`${value} pasien`, "Jumlah"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1D7CF3"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, isNearest = false }: { appointment: Appointment; isNearest?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl p-4 ${
      isNearest ? "bg-[#FEF3E8]" : "bg-white border border-gray-100"
    }`}>
      <div>
        <p className="font-medium text-gray-800">{appointment.patientName}</p>
        <p className="text-sm text-gray-500">{appointment.time}</p>
      </div>
      <span className="text-sm font-medium text-[#F97316]">
        {appointment.status}
      </span>
    </div>
  );
}

export default function DokterDashboardPage() {
  const [statistikData] = useState<StatistikData[]>(defaultStatistikData);
  const [appointments] = useState<Appointment[]>(defaultAppointments);
  const [stats] = useState<DashboardStats>({
    totalPasien: 209,
    pendapatan: "Rp12.050.000",
    appointments: 4,
  });
  const [selectedPeriod, setSelectedPeriod] = useState("Tahun ini");

  // Fetch data from backend (example implementation)
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const [statsRes, chartRes, appointmentsRes] = await Promise.all([
  //         fetch('/api/dokter/stats'),
  //         fetch('/api/dokter/statistik?period=' + selectedPeriod),
  //         fetch('/api/dokter/appointments/today'),
  //       ]);
  //
  //       const statsData = await statsRes.json();
  //       const chartData = await chartRes.json();
  //       const appointmentsData = await appointmentsRes.json();
  //
  //       setStats(statsData);
  //       setStatistikData(chartData);
  //       setAppointments(appointmentsData);
  //     } catch (error) {
  //       console.error("Failed to fetch dashboard data:", error);
  //     }
  //   };
  //   fetchDashboardData();
  // }, [selectedPeriod]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 xl:grid-cols-3"
    >
      {/* Left Column - Main Content */}
      <div className="space-y-6 xl:col-span-2">
        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-white"
        >
          {/* Hexagon Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/assets/hexagon-bg.svg"
              alt=""
              fill
              className="object-cover opacity-50"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between lg:p-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800 lg:text-2xl">
                Halo, dr. Hanifa
              </h1>
              <p className="mt-1 text-gray-500">Have a nice day!</p>
            </div>

            {/* Avatar with pink frame */}
            <div className="relative h-24 w-24 lg:h-28 lg:w-28">
              <Image
                src="/images/assets/pinkframe-bg.svg"
                alt=""
                fill
                className="object-contain"
              />
              <div className="absolute inset-2 overflow-hidden rounded-full">
                <Image
                  src="/images/assets/hello-avatar.svg"
                  alt="Doctor Avatar"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <StatsCard value={stats.totalPasien} label="Total Pasien" />
          <StatsCard value={stats.pendapatan} label="Pendapatan" />
          <StatsCard value={stats.appointments} label="Appointments" />
        </motion.div>

        {/* Statistik Chart */}
        <StatistikChart
          data={statistikData}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Right Column - Appointments */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-white p-5 lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Pertemuan Hari Ini
          </h3>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-600">
            {appointments.length}
          </span>
        </div>

        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              isNearest={index === 0}
            />
          ))}
        </div>

        <Link
          href="/dokter-dashboard/konsultasi"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:text-[#1565D8]"
        >
          Lihat Semua Pasien
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

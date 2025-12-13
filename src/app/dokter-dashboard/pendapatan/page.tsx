"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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

// Types
interface StatistikData {
  name: string;
  value: number;
}

interface RiwayatPendapatan {
  id: string;
  patientName: string;
  patientAge: string;
  tanggal: string;
  durasi: string;
  biaya: string;
}

interface DashboardStats {
  totalPasien: number;
  pendapatan: string;
  appointments: number;
}

// Default data
const defaultStatistikData: StatistikData[] = [
  { name: "0", value: 45 },
  { name: "Jan", value: 50 },
  { name: "Feb", value: 48 },
  { name: "Mar", value: 52 },
  { name: "Apr", value: 45 },
  { name: "May", value: 60 },
  { name: "Jun", value: 55 },
  { name: "Jul", value: 75 },
  { name: "Aug", value: 90 },
  { name: "Sep", value: 85 },
  { name: "Oct", value: 95 },
  { name: "Nov", value: 70 },
  { name: "Dec", value: 65 },
];

const defaultRiwayat: RiwayatPendapatan[] = [
  {
    id: "1",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    tanggal: "18 Desember 2025",
    durasi: "2 jam",
    biaya: "Rp250.000",
  },
  {
    id: "2",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    tanggal: "18 Desember 2025",
    durasi: "2 jam",
    biaya: "Rp250.000",
  },
  {
    id: "3",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    tanggal: "18 Desember 2025",
    durasi: "2 jam",
    biaya: "Rp250.000",
  },
  {
    id: "4",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    tanggal: "18 Desember 2025",
    durasi: "2 jam",
    biaya: "Rp250.000",
  },
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
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5"
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

// Statistik Pendapatan Chart Component
function StatistikPendapatanChart({
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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Statistik Pendapatan
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-gray-800 lg:text-3xl">
              Rp45.050.000
            </span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
              +20%
            </span>
            <span className="text-sm text-gray-500">
              Meningkat dibanding tahun lalu
            </span>
          </div>
        </div>

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
              <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
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
              domain={[0, 100]}
              ticks={[50, 100]}
              tickFormatter={(value) => `${value} juta`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`Rp${value} juta`, "Pendapatan"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1D7CF3"
              strokeWidth={2}
              fill="url(#colorPendapatan)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Riwayat Pendapatan Table Component
function RiwayatPendapatanTable({
  data,
  selectedPeriod,
  onPeriodChange,
}: {
  data: RiwayatPendapatan[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const periods = ["Tahun ini", "Bulan ini", "Minggu ini"];

  return (
    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Riwayat Pendapatan
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-left text-sm font-medium text-gray-500">
                Pasien
              </th>
              <th className="pb-4 text-left text-sm font-medium text-gray-500">
                Tanggal
              </th>
              <th className="pb-4 text-left text-sm font-medium text-gray-500">
                Durasi
              </th>
              <th className="pb-4 text-left text-sm font-medium text-gray-500">
                Biaya
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src="/images/assets/patient-avatar.svg"
                        alt={item.patientName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.patientName}
                      </p>
                      <p className="text-sm text-gray-500">{item.patientAge}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-600">{item.tanggal}</td>
                <td className="py-4 text-sm text-gray-600">{item.durasi}</td>
                <td className="py-4 text-sm font-medium text-[#1D7CF3]">
                  {item.biaya}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function PendapatanPage() {
  const [statistikData] = useState<StatistikData[]>(defaultStatistikData);
  const [riwayatData] = useState<RiwayatPendapatan[]>(defaultRiwayat);
  const [stats] = useState<DashboardStats>({
    totalPasien: 209,
    pendapatan: "Rp12.050.000",
    appointments: 4,
  });
  const [chartPeriod, setChartPeriod] = useState("Tahun ini");
  const [tablePeriod, setTablePeriod] = useState("Tahun ini");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
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

      {/* Statistik Pendapatan Chart */}
      <StatistikPendapatanChart
        data={statistikData}
        selectedPeriod={chartPeriod}
        onPeriodChange={setChartPeriod}
      />

      {/* Riwayat Pendapatan Table */}
      <RiwayatPendapatanTable
        data={riwayatData}
        selectedPeriod={tablePeriod}
        onPeriodChange={setTablePeriod}
      />
    </motion.div>
  );
}

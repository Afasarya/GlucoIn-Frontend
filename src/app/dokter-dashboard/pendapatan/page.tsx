"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getMyIncome,
  getMyDashboard,
  getMyDoctorProfile,
  formatCurrency,
  formatDate,
  calculateAge,
  DoctorIncome,
  DoctorDashboard,
  Doctor,
} from "@/lib/api/doctor";

// Types
interface StatistikData {
  name: string;
  value: number;
}

interface RiwayatItem {
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
  totalIncome,
  percentChange,
  isLoading,
}: {
  data: StatistikData[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  totalIncome: number;
  percentChange: number;
  isLoading: boolean;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const periods = ["Tahun ini", "Bulan ini", "Minggu ini"];

  // Find max value for dynamic Y axis
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const yAxisMax = Math.ceil(maxValue / 10) * 10 + 10;

  return (
    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Statistik Pendapatan
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-800 lg:text-3xl">
                  {formatCurrency(totalIncome)}
                </span>
                {percentChange !== 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    percentChange >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(0)}%
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {percentChange >= 0 ? 'Meningkat' : 'Menurun'} dibanding periode lalu
                </span>
              </>
            )}
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
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D7CF3] border-t-transparent" />
          </div>
        ) : (
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
                domain={[0, yAxisMax]}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)} jt`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
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
        )}
      </div>
    </motion.div>
  );
}

// Riwayat Pendapatan Table Component
function RiwayatPendapatanTable({
  data,
  selectedPeriod,
  onPeriodChange,
  isLoading,
}: {
  data: RiwayatItem[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
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
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D7CF3] border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-gray-500">Belum ada riwayat pendapatan</p>
          </div>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-[350px] animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

export default function PendapatanPage() {
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [incomeData, setIncomeData] = useState<DoctorIncome | null>(null);
  const [statistikData, setStatistikData] = useState<StatistikData[]>([]);
  const [riwayatData, setRiwayatData] = useState<RiwayatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chartPeriod, setChartPeriod] = useState("Tahun ini");
  const [tablePeriod, setTablePeriod] = useState("Tahun ini");

  // Convert period to API format
  const getPeriodParam = (period: string): 'year' | 'month' | 'week' => {
    switch (period) {
      case "Tahun ini": return 'year';
      case "Bulan ini": return 'month';
      case "Minggu ini": return 'week';
      default: return 'year';
    }
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [profileRes, dashboardRes, incomeRes] = await Promise.all([
        getMyDoctorProfile(),
        getMyDashboard(),
        getMyIncome(getPeriodParam(chartPeriod)),
      ]);
      
      setDoctorProfile(profileRes);
      setDashboard(dashboardRes);
      setIncomeData(incomeRes);
      
      // Transform monthly income to chart data
      if (incomeRes.monthly_income && Array.isArray(incomeRes.monthly_income)) {
        const chartData = incomeRes.monthly_income.map((item) => ({
          name: typeof item === 'object' ? item.month : '',
          value: typeof item === 'object' ? item.income : item,
        }));
        setStatistikData(chartData);
      }
      
      // Note: recent_bookings removed from DoctorIncome type
      // Riwayat data will be empty for now
      setRiwayatData([]);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data pendapatan');
    } finally {
      setIsLoading(false);
    }
  }, [chartPeriod]);

  // Fetch income when chart period changes
  const fetchIncomeByPeriod = useCallback(async (period: string) => {
    try {
      setIsChartLoading(true);
      const incomeRes = await getMyIncome(getPeriodParam(period));
      setIncomeData(incomeRes);
      
      // Transform monthly income to chart data
      if (incomeRes.monthly_income && Array.isArray(incomeRes.monthly_income)) {
        const chartData = incomeRes.monthly_income.map((item) => ({
          name: typeof item === 'object' ? item.month : '',
          value: typeof item === 'object' ? item.income : item,
        }));
        setStatistikData(chartData);
      }
    } catch (err) {
      console.error('Error fetching income:', err);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  // Calculate duration between times
  function calculateDuration(startTime: string, endTime: string): string {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`;
      if (hours > 0) return `${hours} jam`;
      return `${minutes} menit`;
    } catch {
      return '-';
    }
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle chart period change
  const handleChartPeriodChange = (period: string) => {
    setChartPeriod(period);
    fetchIncomeByPeriod(period);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-[#1D7CF3] px-6 py-2 text-white hover:bg-[#1565D8]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const stats: DashboardStats = {
    totalPasien: dashboard?.summary?.total_patients || 0,
    pendapatan: formatCurrency(incomeData?.total_income || 0),
    appointments: dashboard?.summary?.upcoming_appointments || 0,
  };

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
              Halo, dr. {doctorProfile?.full_name || 'Dokter'}
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
                src={doctorProfile?.profile_picture || "/images/assets/hello-avatar.svg"}
                alt="Doctor Avatar"
                fill
                className="object-cover"
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
        onPeriodChange={handleChartPeriodChange}
        totalIncome={incomeData?.total_income || 0}
        percentChange={incomeData?.percent_change || 0}
        isLoading={isChartLoading}
      />

      {/* Riwayat Pendapatan Table */}
      <RiwayatPendapatanTable
        data={riwayatData}
        selectedPeriod={tablePeriod}
        onPeriodChange={setTablePeriod}
        isLoading={isChartLoading}
      />
    </motion.div>
  );
}

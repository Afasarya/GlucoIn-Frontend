"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Loader2 } from "lucide-react";
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
  getMyDashboard,
  getMyIncome,
  getMyDoctorProfile,
  formatCurrency,
  formatTimeRange,
  DoctorDashboard,
  DoctorIncome,
  Doctor,
  AppointmentDetail,
} from "@/lib/api/doctor";

// Types for chart data
interface StatistikData {
  name: string;
  value: number;
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
  isLoading = false,
}: {
  data: StatistikData[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading?: boolean;
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
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
          </div>
        ) : (
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
              domain={[0, 'auto']}
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
        )}
      </div>
    </motion.div>
  );
}

// Appointment Card Component
function AppointmentCard({ 
  appointment, 
  isNearest = false 
}: { 
  appointment: AppointmentDetail; 
  isNearest?: boolean;
}) {
  const timeDisplay = appointment.start_time && appointment.end_time 
    ? formatTimeRange(appointment.start_time, appointment.end_time)
    : '-';

  return (
    <div className={`flex items-center justify-between rounded-xl p-4 ${
      isNearest ? "bg-[#FEF3E8]" : "bg-white border border-gray-100"
    }`}>
      <div>
        <p className="font-medium text-gray-800">
          {appointment.patient?.full_name || 'Pasien'}
        </p>
        <p className="text-sm text-gray-500">{timeDisplay}</p>
      </div>
      <span className="text-sm font-medium text-[#F97316]">
        {appointment.consultation_type === 'ONLINE' ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

export default function DokterDashboardPage() {
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [incomeData, setIncomeData] = useState<DoctorIncome | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Tahun ini");
  const [error, setError] = useState<string | null>(null);

  // Map period to API parameter
  const getPeriodParam = (period: string): 'today' | 'week' | 'month' | 'year' | 'all' => {
    switch (period) {
      case "Minggu ini": return 'week';
      case "Bulan ini": return 'month';
      case "Tahun ini": return 'year';
      default: return 'year';
    }
  };

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [dashboardData, profileData] = await Promise.all([
        getMyDashboard(),
        getMyDoctorProfile(),
      ]);
      
      setDashboard(dashboardData);
      setDoctorProfile(profileData);
      setIncomeData(dashboardData.income);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch income data based on period
  const fetchIncomeData = useCallback(async (period: string) => {
    try {
      setIsChartLoading(true);
      const data = await getMyIncome(getPeriodParam(period));
      setIncomeData(data);
    } catch (err) {
      console.error('Error fetching income:', err);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    fetchIncomeData(period);
  };

  // Transform monthly income data for chart
  const chartData: StatistikData[] = incomeData?.monthly_income?.map((item) => ({
    name: item.month,
    value: item.income,
  })) || [];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={fetchDashboard}
          className="rounded-lg bg-[#1D7CF3] px-6 py-2 text-white hover:bg-[#1565D8]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const doctorName = doctorProfile?.user?.full_name || 'Dokter';

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
                Halo, {doctorName}
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
                  src={doctorProfile?.user?.profile_picture_url || "/images/assets/hello-avatar.svg"}
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
          <StatsCard 
            value={dashboard?.summary?.total_patients || 0} 
            label="Total Pasien" 
          />
          <StatsCard 
            value={formatCurrency(dashboard?.summary?.total_income_this_month || 0)} 
            label="Pendapatan Bulan Ini" 
          />
          <StatsCard 
            value={dashboard?.summary?.upcoming_appointments || 0} 
            label="Appointments" 
          />
        </motion.div>

        {/* Statistik Chart */}
        <StatistikChart
          data={chartData}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          isLoading={isChartLoading}
        />
      </div>

      {/* Right Column - Appointments */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-white p-5 lg:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Pertemuan Hari Ini
          </h3>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-600">
            {dashboard?.summary?.today_appointments || 0}
          </span>
        </div>

        <div className="space-y-3">
          {dashboard?.upcoming && dashboard.upcoming.length > 0 ? (
            dashboard.upcoming.map((appointment, index) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                isNearest={index === 0}
              />
            ))
          ) : (
            <p className="py-8 text-center text-gray-500">
              Tidak ada pertemuan hari ini
            </p>
          )}
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

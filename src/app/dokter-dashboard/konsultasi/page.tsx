"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ChevronDown, List, LayoutGrid, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getDoctorBookings,
  formatDate,
  formatTimeRange,
  getBookingStatusLabel,
  getBookingStatusColor,
  calculateAge,
  Booking,
} from "@/lib/api/doctor";

// Types
interface StatsData {
  konsultasiHariIni: number;
  semuaKonsultasi: number;
  konsultasiBulanIni: number;
  konsultasiSelesai: number;
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
function StatsCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <p className="text-2xl font-bold text-gray-800 lg:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Konsultasi Card Component
function KonsultasiCard({ booking }: { booking: Booking }) {
  const patientAge = booking.user?.date_of_birth 
    ? `${calculateAge(booking.user.date_of_birth)} tahun`
    : '-';
  
  const statusColor = getBookingStatusColor(booking.status);
  const statusLabel = getBookingStatusLabel(booking.status);
  const isCompleted = booking.status === 'COMPLETED';
  
  return (
    <Link href={`/dokter-dashboard/konsultasi/${booking.id}`}>
      <motion.div
        variants={itemVariants}
        className="cursor-pointer rounded-2xl bg-white p-5 transition-shadow hover:shadow-md"
      >
        {/* Header - Avatar, Name, Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src="/images/assets/patient-avatar.svg"
                alt={booking.user?.full_name || 'Pasien'}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{booking.user?.full_name || 'Pasien'}</p>
              <p className="text-sm text-gray-500">{patientAge}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
          >
            {isCompleted ? 'selesai' : 'mendatang'}
          </span>
        </div>

        {/* Jadwal Pemeriksaan */}
        <div className="mt-5">
          <p className="text-sm text-gray-500">Jadwal Pemeriksaan</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {formatDate(booking.booking_date)} · {formatTimeRange(booking.start_time, booking.end_time)}
          </p>
        </div>

        {/* Jenis Pemeriksaan */}
        <div className="mt-4">
          <p className="text-sm text-gray-500">Jenis Pemeriksaan</p>
          <p className="mt-1 text-sm font-medium text-[#1D7CF3]">
            {booking.consultation_type === 'ONLINE' ? 'Konsultasi Online' : 'Langsung ke tempat'}
          </p>
        </div>

        {/* Status Label */}
        <div className="mt-4">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
            {statusLabel}
          </span>
        </div>

        {/* Chat Button */}
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D7CF3] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]">
          Chat
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </Link>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function KonsultasiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    konsultasiHariIni: 0,
    semuaKonsultasi: 0,
    konsultasiBulanIni: 0,
    konsultasiSelesai: 0,
  });

  const filters = ["Hari Ini", "Mendatang", "Selesai", "Semua"];
  const sortOptions = ["Nama A-Z", "Nama Z-A", "Terbaru", "Terlama"];

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getDoctorBookings();
      setBookings(data);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todayBookings = data.filter(b => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate >= today && bookingDate < tomorrow;
      });
      
      const monthBookings = data.filter(b => {
        const bookingDate = new Date(b.booking_date);
        return bookingDate >= thisMonth;
      });
      
      const completedBookings = data.filter(b => b.status === 'COMPLETED');
      
      setStats({
        konsultasiHariIni: todayBookings.length,
        semuaKonsultasi: data.length,
        konsultasiBulanIni: monthBookings.length,
        konsultasiSelesai: completedBookings.length,
      });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data konsultasi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings based on active filter
  const filteredBookings = bookings.filter((booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = new Date(booking.booking_date);
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = booking.user?.full_name?.toLowerCase().includes(query);
      const matchesDate = formatDate(booking.booking_date).toLowerCase().includes(query);
      if (!matchesName && !matchesDate) return false;
    }
    
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Hari Ini") {
      return bookingDate >= today && bookingDate < tomorrow;
    }
    if (activeFilter === "Mendatang") {
      return bookingDate >= today && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
    }
    if (activeFilter === "Selesai") return booking.status === 'COMPLETED';
    return true;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case "Nama A-Z":
        return (a.user?.full_name || '').localeCompare(b.user?.full_name || '');
      case "Nama Z-A":
        return (b.user?.full_name || '').localeCompare(a.user?.full_name || '');
      case "Terbaru":
        return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
      case "Terlama":
        return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={fetchBookings}
          className="rounded-lg bg-[#1D7CF3] px-6 py-2 text-white hover:bg-[#1565D8]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search and Filter Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5"
      >
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari dari nama atau tanggal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#1D7CF3] focus:outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            {sortBy}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isSortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    sortBy === option
                      ? "bg-[#EEF8FF] text-[#1D7CF3]"
                      : "text-gray-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs and View Toggle */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-[#1D7CF3] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatsCard value={stats.konsultasiHariIni} label="Konsultasi hari ini" />
        <StatsCard value={stats.semuaKonsultasi} label="Semua konsultasi" />
        <StatsCard value={stats.konsultasiBulanIni} label="Konsultasi bulan ini" />
        <StatsCard value={stats.konsultasiSelesai} label="Konsultasi selesai" />
      </motion.div>

      {/* Konsultasi Cards Grid */}
      <motion.div
        variants={containerVariants}
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {sortedBookings.length > 0 ? (
          sortedBookings.map((booking) => (
            <KonsultasiCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center">
            <p className="text-gray-500">Tidak ada konsultasi ditemukan</p>
            <p className="mt-1 text-sm text-gray-400">
              {activeFilter !== "Semua" ? "Coba ubah filter atau " : ""}
              {searchQuery ? "hapus pencarian" : ""}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

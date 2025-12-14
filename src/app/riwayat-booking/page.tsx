"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import {
  getMyBookings,
  Booking,
  formatCurrency,
  getBookingStatusColor,
  getPaymentStatusColor,
} from "@/lib/api/booking";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Status filter options
const statusFilters = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'EXPIRED', label: 'Expired' },
];

// Loading Skeleton
function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-8 w-24 rounded-full bg-gray-200" />
            <div className="h-8 w-24 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiwayatBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyBookings(statusFilter || undefined);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data booking');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings by search query
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.doctor?.name?.toLowerCase().includes(query) ||
      booking.doctor?.specialization?.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query)
    );
  });

  // Format date
  const formatBookingDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Booking</h1>
          <p className="mt-1 text-gray-500">Lihat dan kelola booking konsultasi Anda</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari booking atau dokter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchBookings}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1D7CF3] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1565D8] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <button onClick={fetchBookings} className="ml-auto text-sm underline hover:no-underline">
              Coba lagi
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF8FF]">
              <Calendar className="h-10 w-10 text-[#1D7CF3]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              {searchQuery || statusFilter ? 'Tidak ada booking ditemukan' : 'Belum ada booking'}
            </h3>
            <p className="mb-6 text-gray-500">
              {searchQuery || statusFilter 
                ? 'Coba ubah filter pencarian Anda'
                : 'Mulai booking konsultasi dengan dokter spesialis'}
            </p>
            <Link href="/booking-dokter">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full bg-[#1D7CF3] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
              >
                Booking Sekarang
              </motion.button>
            </Link>
          </div>
        )}

        {/* Booking List */}
        {!isLoading && !error && filteredBookings.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredBookings.map((booking) => {
              const statusColor = getBookingStatusColor(booking.status);
              const paymentStatusColor = getPaymentStatusColor(booking.payment_status);
              
              return (
                <motion.div
                  key={booking.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Doctor Image */}
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#EEF8FF]">
                        <Image
                          src="/images/assets/doctor-elipse.svg"
                          alt={booking.doctor?.name || 'Doctor'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          {booking.status_label}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusColor.bg} ${paymentStatusColor.text}`}>
                          {booking.payment_status_label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800">
                        {booking.doctor?.name || 'Dokter'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.doctor?.specialization}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-[#1D7CF3]" />
                          <span>{formatBookingDate(booking.booking_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-[#1D7CF3]" />
                          <span>
                            {booking.start_time.replace(':', '.')} - {booking.end_time.replace(':', '.')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-[#1D7CF3]" />
                          <span>{booking.consultation_type_label}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-lg font-bold text-[#1D7CF3]">
                            {formatCurrency(booking.consultation_fee)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {booking.status === 'PENDING_PAYMENT' && (
                            <Link href={`/booking-dokter/${booking.doctor?.id}/payment`}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-full bg-[#1D7CF3] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
                              >
                                Bayar Sekarang
                              </motion.button>
                            </Link>
                          )}
                          <Link href={`/riwayat-booking/${booking.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              Detail
                              <ChevronRight className="h-4 w-4" />
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">
                      ID: {booking.id.substring(0, 18)}...
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Stats */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Menampilkan {filteredBookings.length} dari {bookings.length} booking
          </div>
        )}
      </div>
    </div>
  );
}

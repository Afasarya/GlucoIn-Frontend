"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, MessageCircle, ArrowRight, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyBookings, Booking } from "@/lib/api/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function KonsultasiPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5).replace(":", ".");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING_PAYMENT: { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
      PENDING: { label: "Menunggu Konfirmasi", className: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "Dikonfirmasi", className: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "Selesai", className: "bg-green-100 text-green-700" },
      CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
      EXPIRED: { label: "Kedaluwarsa", className: "bg-gray-100 text-gray-700" },
    };
    return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  };

  // Get today's consultation (confirmed, for today)
  const today = new Date().toISOString().split("T")[0];
  const todayConsultation = bookings.find(
    (b) => b.booking_date === today && b.status === "CONFIRMED"
  );

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "mendatang") {
      return ["PENDING", "CONFIRMED", "PENDING_PAYMENT"].includes(booking.status);
    }
    if (filterStatus === "selesai") {
      return booking.status === "COMPLETED";
    }
    return true;
  }).filter((booking) => {
    if (!searchQuery) return true;
    return (
      booking.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(booking.booking_date).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-800">Konsultasi</h1>
        <p className="text-gray-500">Kelola jadwal konsultasi Anda dengan dokter</p>
      </motion.div>

      {/* Today's Consultation Banner */}
      {todayConsultation && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-gradient-to-r from-[#1D7CF3] to-[#3B93FF] p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/30">
                <Image
                  src="/images/avatars/doctor-placeholder.svg"
                  alt={todayConsultation.doctor?.name || "Doctor"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-blue-100">Konsultasi Hari Ini</p>
                <p className="text-xl font-semibold">
                  {todayConsultation.doctor?.name}
                </p>
                <div className="mt-1 flex items-center gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(todayConsultation.start_time)} - {formatTime(todayConsultation.end_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {todayConsultation.consultation_type === "ONLINE" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/dashboard/pesan?room=${todayConsultation.id}`}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[#1D7CF3] hover:bg-blue-50"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Chat</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama dokter atau tanggal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-8 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="mendatang">Mendatang</option>
              <option value="selesai">Selesai</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Booking List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Memuat data konsultasi...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Tidak ada data konsultasi</p>
            <Link
              href="/cari-dokter"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1D7CF3] px-4 py-2 text-white hover:bg-blue-600"
            >
              Cari Dokter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            return (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                    <Image
                      src="/images/avatars/doctor-placeholder.svg"
                      alt={booking.doctor?.name || "Doctor"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {booking.doctor?.name || "Dokter"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.doctor?.specialization || "Spesialis"}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(booking.booking_date)}</span>
                      <span>•</span>
                      <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                  <span className={`text-sm font-medium ${
                    booking.consultation_type === "ONLINE" ? "text-[#1D7CF3]" : "text-orange-500"
                  }`}>
                    {booking.consultation_type === "ONLINE" ? "Online" : "Offline"}
                  </span>
                  {booking.status === "CONFIRMED" && (
                    <Link
                      href={`/dashboard/pesan?room=${booking.id}`}
                      className="flex items-center gap-2 rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm text-white hover:bg-blue-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Link>
                  )}
                  {booking.status === "COMPLETED" && (
                    <Link
                      href={`/dashboard/konsultasi/${booking.id}`}
                      className="flex items-center gap-2 rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm text-[#1D7CF3] hover:bg-blue-50"
                    >
                      Lihat Detail
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {booking.status === "PENDING_PAYMENT" && (
                    <Link
                      href={`/booking/payment/${booking.id}`}
                      className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
                    >
                      Bayar Sekarang
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}

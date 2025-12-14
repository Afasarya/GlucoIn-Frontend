"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, ChevronDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  getMyBookings,
  getDetectionHistory,
  getDetectionStats,
  Booking,
  Detection,
  DetectionStats,
} from "@/lib/api/dashboard";

type TabType = "konsultasi" | "deteksi";
type StatusFilter = "semua" | "akan-berlangsung" | "selesai";

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

export default function RiwayatPage() {
  const [activeTab, setActiveTab] = useState<TabType>("konsultasi");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [sortBy, setSortBy] = useState("terbaru");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [detectionStats, setDetectionStats] = useState<DetectionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "konsultasi") {
        const data = await getMyBookings();
        setBookings(data);
      } else {
        const [historyData, statsData] = await Promise.all([
          getDetectionHistory({ limit: 20 }),
          getDetectionStats(),
        ]);
        setDetections(historyData.data || []);
        setDetectionStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "akan-berlangsung") {
      return ["PENDING", "CONFIRMED", "PENDING_PAYMENT"].includes(booking.status);
    }
    if (statusFilter === "selesai") {
      return booking.status === "COMPLETED";
    }
    return true;
  }).filter((booking) => {
    if (!searchQuery) return true;
    return booking.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      PENDING: { label: "mendatang", className: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "mendatang", className: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "selesai", className: "bg-green-100 text-green-700" },
      CANCELLED: { label: "dibatalkan", className: "bg-red-100 text-red-700" },
      EXPIRED: { label: "kedaluwarsa", className: "bg-gray-100 text-gray-700" },
    };
    return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  };

  const getRiskLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; className: string }> = {
      NORMAL: { label: "Normal", className: "bg-green-100 text-green-700" },
      SEDANG: { label: "Sedang", className: "bg-yellow-100 text-yellow-700" },
      TINGGI: { label: "Tinggi", className: "bg-red-100 text-red-700" },
    };
    return levelMap[level] || { label: level, className: "bg-gray-100 text-gray-700" };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Masukkan tanggal atau status risiko"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-8 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-8 text-sm focus:border-blue-500 focus:outline-none">
                <option value="normal">Normal</option>
                <option value="all">Semua</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Rekapan Aktivitasmu</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center">
              <Image
                src="/images/icons/detection.svg"
                alt="Deteksi"
                width={64}
                height={64}
                onError={(e) => {
                  e.currentTarget.src = "/images/icons/search.svg";
                }}
              />
            </div>
            <div>
              <p className="text-4xl font-bold text-[#1D7CF3]">
                {detectionStats?.total || detections.length || 13}
              </p>
              <p className="text-gray-600">Deteksi Dini</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center">
              <Image
                src="/images/icons/consultation.svg"
                alt="Konsultasi"
                width={64}
                height={64}
                onError={(e) => {
                  e.currentTarget.src = "/images/icons/doctor.svg";
                }}
              />
            </div>
            <div>
              <p className="text-4xl font-bold text-[#1D7CF3]">{bookings.length || 13}</p>
              <p className="text-gray-600">Konsultasi Dokter</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("konsultasi")}
            className={`border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "konsultasi"
                ? "border-[#1D7CF3] text-[#1D7CF3]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Rekapan Konsultasi
          </button>
          <button
            onClick={() => setActiveTab("deteksi")}
            className={`border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "deteksi"
                ? "border-[#1D7CF3] text-[#1D7CF3]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Rekapan Deteksi
          </button>
        </div>

        {activeTab === "konsultasi" ? (
          <div className="space-y-4">
            {/* Search and Filter for Konsultasi */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan tanggal atau dokter"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500">Urutkan:</span>
                <select className="appearance-none border-none bg-transparent text-gray-700 focus:outline-none">
                  <option>Terbaru</option>
                  <option>Terlama</option>
                </select>
                <select className="appearance-none border-none bg-transparent text-gray-700 focus:outline-none">
                  <option>Normal</option>
                  <option>Semua</option>
                </select>
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: "semua", label: "Semua" },
                { key: "akan-berlangsung", label: "Akan Berlangsung" },
                { key: "selesai", label: "Selesai" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as StatusFilter)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    statusFilter === filter.key
                      ? "bg-[#1D7CF3] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Bookings List */}
            {loading ? (
              <div className="py-8 text-center text-gray-500">Memuat data...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Tidak ada riwayat konsultasi</div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                          <Image
                            src="/images/avatars/doctor-placeholder.svg"
                            alt={booking.doctor?.name || "Doctor"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">
                              {formatDate(booking.booking_date)}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {booking.doctor?.name || "Dokter"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booking.doctor?.specialization || "Spesialis"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                        <span className={`text-sm ${
                          booking.consultation_type === "ONLINE" ? "text-[#1D7CF3]" : "text-orange-500"
                        }`}>
                          {booking.consultation_type_label || booking.consultation_type}
                        </span>
                        {booking.status === "COMPLETED" ? (
                          <Link
                            href={`/dashboard/konsultasi/${booking.id}`}
                            className="rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm text-white hover:bg-blue-600"
                          >
                            Lihat →
                          </Link>
                        ) : booking.status === "CONFIRMED" || booking.status === "PENDING" ? (
                          <span className="text-sm text-[#1D7CF3]">Akan Berlangsung</span>
                        ) : (
                          <Link
                            href={`/dashboard/konsultasi/${booking.id}`}
                            className="text-sm text-[#1D7CF3] hover:underline"
                          >
                            Selesai
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Detection Stats */}
            {detectionStats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-4 text-center">
                  <p className="text-3xl">😊</p>
                  <p className="text-2xl font-bold text-green-600">
                    {detectionStats.by_risk_level?.NORMAL || 13}
                  </p>
                  <p className="text-sm text-gray-600">Deteksi Risiko Normal</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 text-center">
                  <p className="text-3xl">😐</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {detectionStats.by_risk_level?.SEDANG || 3}
                  </p>
                  <p className="text-sm text-gray-600">Deteksi Risiko Sedang</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-4 text-center">
                  <p className="text-3xl">😟</p>
                  <p className="text-2xl font-bold text-red-600">
                    {detectionStats.by_risk_level?.TINGGI || 0}
                  </p>
                  <p className="text-sm text-gray-600">Deteksi Risiko Tinggi</p>
                </div>
              </div>
            )}

            {/* Detection List */}
            {loading ? (
              <div className="py-8 text-center text-gray-500">Memuat data...</div>
            ) : detections.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Tidak ada riwayat deteksi</div>
            ) : (
              <div className="space-y-3">
                {detections.map((detection) => {
                  const riskBadge = getRiskLevelBadge(detection.risk_level);
                  return (
                    <div
                      key={detection.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {detection.tongue_image_url && (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                              <Image
                                src={detection.tongue_image_url}
                                alt="Tongue"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          {detection.nail_image_url && (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                              <Image
                                src={detection.nail_image_url}
                                alt="Nail"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          {!detection.tongue_image_url && !detection.nail_image_url && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                              <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {formatDate(detection.created_at)}, {new Date(detection.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Level risiko</span>
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${riskBadge.className}`}>
                              {riskBadge.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Tingkat keakuratan: {detection.accuracy}%
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/deteksi-dini/${detection.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

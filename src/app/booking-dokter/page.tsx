"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, DollarSign, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import {
  getAllDoctors,
  Doctor,
  parsePriceRange,
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

const sidebarVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
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

const priceRanges = [
  { id: "price1", label: "<100.000", min: 0, max: 100000 },
  { id: "price2", label: "100.000 - 150.000", min: 100000, max: 150000 },
  { id: "price3", label: "150.000 - 200.000", min: 150000, max: 200000 },
  { id: "price4", label: ">200.000", min: 200000, max: Infinity },
];

// Loading Skeleton
function DoctorCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm sm:flex-row animate-pulse">
      <div className="h-32 w-32 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-3 w-full">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-full bg-gray-200" />
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function BookingDokterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllDoctors({ isAvailable: true });
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data dokter');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handlePriceRangeChange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId)
        ? prev.filter((item) => item !== rangeId)
        : [...prev, rangeId]
    );
  };

  // Filter doctors based on search and price range
  const filteredDoctors = doctors.filter((doctor) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = doctor.user.full_name.toLowerCase().includes(query);
      const matchSpecialization = doctor.specialization.toLowerCase().includes(query);
      if (!matchName && !matchSpecialization) return false;
    }

    // Price filter
    if (selectedPriceRanges.length > 0) {
      const doctorMinPrice = parsePriceRange(doctor.price_range);
      const matchPrice = selectedPriceRanges.some((rangeId) => {
        const range = priceRanges.find((r) => r.id === rangeId);
        if (!range) return false;
        return doctorMinPrice >= range.min && doctorMinPrice < range.max;
      });
      if (!matchPrice) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="w-full shrink-0 lg:w-72"
          >
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-800">Filter</h2>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari dokter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
                />
              </div>

              <hr className="mb-6 border-gray-100" />

              {/* Rate Harga Section */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#1D7CF3]" />
                  <span className="font-semibold text-gray-800">Rate Harga</span>
                </div>

                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <label
                      key={range.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(range.id)}
                        onChange={() => handlePriceRangeChange(range.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1D7CF3] focus:ring-[#1D7CF3]"
                      />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 rounded-lg bg-[#EEF8FF] p-4">
                <p className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-[#1D7CF3]">{filteredDoctors.length}</span> dokter
                </p>
              </div>
            </div>
          </motion.div>

          {/* Doctor Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            {/* Error State */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-8 text-center">
                <p className="mb-4 text-red-600">{error}</p>
                <button
                  onClick={fetchDoctors}
                  className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <DoctorCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredDoctors.length === 0 && (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-[#EEF8FF] flex items-center justify-center">
                  <Search className="h-12 w-12 text-[#1D7CF3]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Tidak ada dokter ditemukan
                </h3>
                <p className="text-gray-500">
                  Coba ubah filter pencarian Anda
                </p>
              </div>
            )}

            {/* Doctor List */}
            {!isLoading && !error && filteredDoctors.length > 0 && (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 10px 40px rgba(29, 124, 243, 0.1)",
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm sm:flex-row"
                  >
                    {/* Doctor Image */}
                    <motion.div
                      className="shrink-0"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-[#EEF8FF]">
                        <Image
                          src={doctor.user.profile_picture_url || "/images/assets/doctor-elipse.svg"}
                          alt={doctor.user.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Doctor Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <p className="mb-1 text-sm text-gray-500">
                        {doctor.specialization}
                      </p>
                      <h3 className="mb-3 text-xl font-bold text-gray-800">
                        {doctor.user.full_name}
                      </h3>

                      {doctor.alamat_praktek && (
                        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                          <MapPin className="h-4 w-4 shrink-0 text-[#1D7CF3]" />
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {doctor.alamat_praktek}
                          </span>
                        </div>
                      )}

                      <div className="mb-4 flex items-center justify-center gap-2 sm:justify-start">
                        <DollarSign className="h-4 w-4 text-[#1D7CF3]" />
                        <span className="text-sm text-gray-600">
                          {doctor.price_range || 'Harga konsultasi tersedia'}
                        </span>
                      </div>

                      {/* Schedule info */}
                      {doctor.schedules && doctor.schedules.length > 0 && (
                        <div className="mb-4 flex items-center justify-center gap-2 sm:justify-start">
                          <Star className="h-4 w-4 text-[#1D7CF3]" />
                          <span className="text-sm text-gray-600">
                            {doctor.schedules.length} jadwal tersedia
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-3 sm:justify-start">
                        <Link href={`/booking-dokter/${doctor.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-full bg-[#1D7CF3] px-12 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
                          >
                            Booking
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-[#1D7CF3] transition-colors hover:border-[#1D7CF3] hover:bg-[#EEF8FF]"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

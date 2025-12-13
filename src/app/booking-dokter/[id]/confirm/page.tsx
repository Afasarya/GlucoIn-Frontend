"use client";

import { useState } from "react";
import { Clock, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../../components/common/Navbar";

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

const itemVariants = {
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

const cardVariants = {
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

const summaryVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Consultation types
const consultationTypes = [
  {
    id: "online",
    title: "Online",
    description: "Video call langsung dari Glucoin",
    pricePerHour: 100000,
  },
  {
    id: "offline",
    title: "Langsung ke Tempat",
    description: "Bertemu langsung dengan Dokter",
    pricePerHour: 250000,
  },
];

// Duration options
const durationOptions = [
  { value: 1, label: "1 jam" },
  { value: 2, label: "2 jam" },
  { value: 3, label: "3 jam" },
];

export default function BookingConfirmPage() {
  const [duration, setDuration] = useState(2);
  const [consultationType, setConsultationType] = useState("offline");
  const [notes, setNotes] = useState("");
  const [adminFee] = useState(2500);

  // Get selected consultation type details
  const selectedType = consultationTypes.find((t) => t.id === consultationType);
  const consultationFee = (selectedType?.pricePerHour || 0) * duration;
  const total = consultationFee + adminFee;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  // Mock booking data (would come from previous page in real app)
  const bookingData = {
    date: "18 Desember 2025",
    startTime: "12.00",
    endTime: "14.00",
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Section - Form */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Durasi Konsultasi */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Durasi Konsultasi
                  </h2>
                </div>

                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-4 text-base text-gray-700 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Jenis Konsultasi */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Jenis Konsultasi
                  </h2>
                </div>

                <div className="space-y-3">
                  {consultationTypes.map((type) => (
                    <motion.label
                      key={type.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                        consultationType === type.id
                          ? "border-[#1D7CF3] bg-[#EEF8FF]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            consultationType === type.id
                              ? "border-[#1D7CF3]"
                              : "border-gray-300"
                          }`}
                        >
                          {consultationType === type.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2.5 w-2.5 rounded-full bg-[#1D7CF3]"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {type.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#1D7CF3]">
                          Rp{formatCurrency(type.pricePerHour)}
                        </span>
                        <span className="text-sm text-gray-500"> /jam</span>
                      </div>
                      <input
                        type="radio"
                        name="consultationType"
                        value={type.id}
                        checked={consultationType === type.id}
                        onChange={(e) => setConsultationType(e.target.value)}
                        className="sr-only"
                      />
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Catatan/Keluhan */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Catatan/Keluhan
                  </h2>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sampaikan keluhan atau catatan untuk Dokter"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Section - Ringkasan */}
          <motion.div
            variants={summaryVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-[380px]"
          >
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              {/* Header */}
              <div className="mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1D7CF3]" />
                <h2 className="text-lg font-bold text-gray-800">Ringkasan</h2>
              </div>

              {/* Summary Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tanggal</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData.date}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Waktu</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData.startTime} - {bookingData.endTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Durasi Konsultasi</span>
                  <span className="font-semibold text-gray-800">
                    {duration} jam
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Jenis Konsultasi</span>
                  <span className="font-semibold text-gray-800">
                    {selectedType?.title}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Biaya Konsultasi</span>
                  <span className="font-semibold text-gray-800">
                    Rp{formatCurrency(consultationFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Biaya Admin</span>
                  <span className="font-semibold text-gray-800">
                    Rp{formatCurrency(adminFee)}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-gray-800">
                    Rp{formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full rounded-full bg-[#1D7CF3] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
              >
                Booking
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, User, Copy, Check, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../../components/common/Navbar";
import { formatCurrency } from "@/lib/api/booking";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
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

const checkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

interface BookingSuccessData {
  booking_id: string;
  doctor_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  amount: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingSuccessPage({ params }: PageProps) {
  use(params); // Consume params but id not needed for this page
  const router = useRouter();
  
  const [bookingData, setBookingData] = useState<BookingSuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  // Load booking success data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('bookingSuccess');
    if (storedData) {
      const data = JSON.parse(storedData) as BookingSuccessData;
      // Use setTimeout to avoid sync setState in effect
      setTimeout(() => setBookingData(data), 0);
      // Clear the data after loading
      sessionStorage.removeItem('bookingSuccess');
    } else {
      // No success data, redirect to booking page
      router.push(`/booking-dokter`);
    }
  }, [router]);

  // Copy booking ID to clipboard
  const handleCopyBookingId = async () => {
    if (!bookingData?.booking_id) return;
    
    try {
      await navigator.clipboard.writeText(bookingData.booking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D7CF3] border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-lg">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-white p-8 shadow-sm text-center"
          >
            {/* Success Icon */}
            <motion.div
              variants={checkVariants}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants}>
              <h1 className="mb-2 text-2xl font-bold text-gray-800">
                Booking Berhasil! 🎉
              </h1>
              <p className="text-gray-500">
                Terima kasih! Booking konsultasi Anda telah dikonfirmasi.
              </p>
            </motion.div>

            {/* Booking Details Card */}
            <motion.div
              variants={itemVariants}
              className="mt-8 rounded-xl bg-gradient-to-br from-[#1D7CF3] to-[#1565D8] p-6 text-white"
            >
              <div className="mb-4 flex items-center justify-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-semibold">{bookingData.doctor_name}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 opacity-80" />
                  <span className="text-sm">
                    {new Date(bookingData.booking_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 opacity-80" />
                  <span className="text-sm">
                    {bookingData.start_time.replace(':', '.')} - {bookingData.end_time.replace(':', '.')} WIB
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-white/20 pt-4">
                <p className="text-sm opacity-80">Total Pembayaran</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(bookingData.amount)}
                </p>
              </div>
            </motion.div>

            {/* Booking ID */}
            <motion.div
              variants={itemVariants}
              className="mt-6 rounded-lg bg-gray-50 p-4"
            >
              <p className="mb-2 text-sm text-gray-500">ID Booking</p>
              <div className="flex items-center justify-center gap-2">
                <code className="rounded bg-gray-100 px-3 py-1 text-sm font-mono text-gray-800">
                  {bookingData.booking_id.substring(0, 18)}...
                </code>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyBookingId}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#1D7CF3]"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
              {copied && (
                <p className="mt-1 text-xs text-green-500">ID berhasil disalin!</p>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              variants={itemVariants}
              className="mt-6 rounded-lg bg-blue-50 p-4 text-left"
            >
              <h3 className="mb-2 font-semibold text-blue-800">Langkah Selanjutnya:</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">1</span>
                  <span>Anda akan menerima email konfirmasi dengan detail booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">2</span>
                  <span>Hadir tepat waktu pada jadwal konsultasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">3</span>
                  <span>Siapkan pertanyaan atau keluhan yang ingin dikonsultasikan</span>
                </li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 space-y-3"
            >
              <Link href="/riwayat-booking">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D7CF3] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
                >
                  Lihat Riwayat Booking
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>

              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Home className="h-5 w-5" />
                  Kembali ke Dashboard
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, FileText, MapPin, ArrowLeft, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../../components/common/Navbar";
import {
  createBooking,
  CreateBookingDto,
  formatCurrency,
  getDayName,
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
    id: "ONLINE",
    title: "Online",
    description: "Video call langsung dari Glucoin",
    priceMultiplier: 0.5, // 50% of base price
  },
  {
    id: "OFFLINE",
    title: "Langsung ke Tempat",
    description: "Bertemu langsung dengan Dokter",
    priceMultiplier: 1, // Full price
  },
];

// Duration options
const durationOptions = [
  { value: 60, label: "1 jam", hours: 1 },
  { value: 120, label: "2 jam", hours: 2 },
  { value: 180, label: "3 jam", hours: 3 },
];

interface PendingBookingData {
  doctor_id: string;
  doctor_name: string;
  doctor_specialization: string;
  doctor_image?: string;
  doctor_price_range?: string;
  schedule_id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  consultation_fee: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingConfirmPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [bookingData, setBookingData] = useState<PendingBookingData | null>(null);
  const [duration, setDuration] = useState(60);
  const [consultationType, setConsultationType] = useState<"ONLINE" | "OFFLINE">("OFFLINE");
  const [notes, setNotes] = useState("");
  const [adminFee] = useState(2500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load booking data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('pendingBooking');
    if (storedData) {
      const data = JSON.parse(storedData) as PendingBookingData;
      setBookingData(data);
      if (data.duration_minutes) {
        setDuration(data.duration_minutes);
      }
    } else {
      // No booking data, redirect back
      router.push(`/booking-dokter/${id}`);
    }
  }, [id, router]);

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMins: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Get selected consultation type details
  const selectedType = consultationTypes.find((t) => t.id === consultationType);
  
  // Calculate consultation fee based on base price, duration and type
  const baseHourlyRate = bookingData?.consultation_fee || 150000;
  const durationHours = duration / 60;
  const consultationFee = Math.round(baseHourlyRate * durationHours * (selectedType?.priceMultiplier || 1));
  const total = consultationFee + adminFee;

  // Format date
  const formatBookingDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get day of week from date string
  const getDayFromDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!bookingData) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const endTime = calculateEndTime(bookingData.start_time, duration);
      
      const bookingDto: CreateBookingDto = {
        doctor_id: bookingData.doctor_id,
        schedule_id: bookingData.schedule_id,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: endTime,
        duration_minutes: duration,
        consultation_type: consultationType,
        consultation_fee: consultationFee,
        notes: notes || undefined,
      };
      
      const response = await createBooking(bookingDto);
      
      // Clear pending booking data
      sessionStorage.removeItem('pendingBooking');
      
      // Store payment info for payment page
      sessionStorage.setItem('paymentInfo', JSON.stringify({
        booking_id: response.booking.id,
        snap_token: response.payment.snap_token,
        snap_redirect_url: response.payment.snap_redirect_url,
        order_id: response.payment.order_id,
        amount: response.payment.amount,
        expiry_time: response.payment.expiry_time,
        doctor_name: bookingData.doctor_name,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: endTime,
      }));
      
      // Redirect to payment page
      router.push(`/booking-dokter/${id}/payment`);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Gagal membuat booking. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
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

  const endTime = calculateEndTime(bookingData.start_time, duration);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Back button */}
        <Link href={`/booking-dokter/${id}`}>
          <motion.button
            whileHover={{ x: -4 }}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#1D7CF3]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Detail Dokter</span>
          </motion.button>
        </Link>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-600"
          >
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </motion.div>
        )}

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
              {/* Doctor Info Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Informasi Dokter
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#EEF8FF]">
                    <Image
                      src={bookingData.doctor_image || "/images/assets/doctor-elipse.svg"}
                      alt={bookingData.doctor_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{bookingData.doctor_name}</h3>
                    <p className="text-sm text-gray-500">{bookingData.doctor_specialization}</p>
                    <p className="text-sm text-[#1D7CF3]">{bookingData.doctor_price_range}</p>
                  </div>
                </div>
              </motion.div>
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
                  <MapPin className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Jenis Konsultasi
                  </h2>
                </div>

                <div className="space-y-3">
                  {consultationTypes.map((type) => {
                    const typePrice = Math.round(baseHourlyRate * durationHours * type.priceMultiplier);
                    return (
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
                          {formatCurrency(typePrice)}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="consultationType"
                        value={type.id}
                        checked={consultationType === type.id}
                        onChange={(e) => setConsultationType(e.target.value as "ONLINE" | "OFFLINE")}
                        className="sr-only"
                      />
                    </motion.label>
                    );
                  })}
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
                  <span className="font-semibold text-gray-800 text-right text-sm">
                    {formatBookingDate(bookingData.booking_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Waktu</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData.start_time.replace(':', '.')} - {endTime.replace(':', '.')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Durasi Konsultasi</span>
                  <span className="font-semibold text-gray-800">
                    {duration / 60} jam
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
                    {formatCurrency(consultationFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Biaya Admin</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(adminFee)}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#1D7CF3]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <motion.button
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className={`mt-6 w-full rounded-full py-3.5 text-base font-semibold transition-colors ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#1D7CF3] text-white hover:bg-[#1565D8]"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </span>
                ) : (
                  "Lanjut ke Pembayaran"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Clock, Calendar, MapPin, DollarSign, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/common/Navbar";
import {
  getDoctorById,
  getAvailableSlots,
  Doctor,
  DoctorSchedule,
  AvailableSlot,
  getDayName,
  getDayOfWeek,
  formatCurrency,
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

const calendarVariants = {
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

// Calendar helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert to Monday = 0
};

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const dayNames = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

// Group schedules by day
function groupSchedulesByDay(schedules: DoctorSchedule[]): Record<string, DoctorSchedule[]> {
  const grouped: Record<string, DoctorSchedule[]> = {};
  schedules.forEach(schedule => {
    if (!grouped[schedule.day_of_week]) {
      grouped[schedule.day_of_week] = [];
    }
    grouped[schedule.day_of_week].push(schedule);
  });
  return grouped;
}

// Day order for sorting
const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Loading Skeleton
function DoctorDetailSkeleton() {
  return (
    <div className="flex-1">
      <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
        <div className="mb-8 flex items-start gap-6">
          <div className="h-28 w-28 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-6 w-40 rounded bg-gray-200" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  // Fetch doctor data
  const fetchDoctor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDoctorById(id);
      setDoctor(data);
      
      // Auto expand first day with schedules
      if (data.schedules && data.schedules.length > 0) {
        const groupedSchedules = groupSchedulesByDay(data.schedules);
        const firstDay = dayOrder.find(day => groupedSchedules[day]);
        if (firstDay) {
          setExpandedDay(firstDay);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data dokter');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  // Fetch available slots when date is selected
  const fetchAvailableSlots = useCallback(async (date: Date) => {
    try {
      setLoadingSlots(true);
      const dateStr = date.toISOString().split('T')[0];
      const data = await getAvailableSlots(id, dateStr);
      setAvailableSlots(data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i),
    });
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i),
    });
  }

  // Check if date has schedules
  const hasScheduleOnDate = (date: Date): boolean => {
    if (!doctor?.schedules) return false;
    const dayOfWeek = getDayOfWeek(date);
    return doctor.schedules.some(s => s.day_of_week === dayOfWeek && s.is_active);
  };

  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isPastDate(date) && hasScheduleOnDate(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
      setSelectedSchedule(null);
    }
  };

  // Handle time selection from available slots
  const handleTimeSelect = (slot: AvailableSlot) => {
    setSelectedTime(slot.time_slot);
    // Use slot.id directly as schedule_id - this is the correct schedule for the selected date
    // The available slots API already returns the correct schedule for the selected date's day
    if (doctor?.schedules && selectedDate) {
      // First try to find schedule by id
      let schedule = doctor.schedules.find(s => s.id === slot.id);
      
      if (!schedule) {
        // Fallback: create a schedule object with the slot data
        // This handles cases where the schedule might not be in doctor.schedules
        const dayOfWeek = getDayOfWeek(selectedDate);
        schedule = {
          id: slot.id,
          doctor_id: doctor.id,
          day_of_week: dayOfWeek as DoctorSchedule['day_of_week'],
          time_slot: slot.time_slot,
          duration_minutes: slot.duration_minutes,
          is_active: true,
        };
      }
      
      setSelectedSchedule(schedule);
    }
  };

  // Proceed to booking
  const handleProceedBooking = () => {
    if (!selectedDate || !selectedTime || !selectedSchedule || !doctor) return;
    
    // Store booking data in sessionStorage
    const bookingData = {
      doctor_id: doctor.id,
      doctor_name: doctor.user.full_name,
      doctor_specialization: doctor.specialization,
      doctor_image: doctor.user.profile_picture_url,
      doctor_price_range: doctor.price_range,
      schedule_id: selectedSchedule.id,
      booking_date: selectedDate.toISOString().split('T')[0],
      start_time: selectedTime,
      duration_minutes: selectedSchedule.duration_minutes,
      consultation_fee: parsePriceRange(doctor.price_range),
    };
    
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push(`/booking-dokter/${id}/confirm`);
  };

  // Group schedules
  const groupedSchedules = doctor?.schedules ? groupSchedulesByDay(doctor.schedules) : {};
  const sortedDays = dayOrder.filter(day => groupedSchedules[day]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <DoctorDetailSkeleton />
            <div className="w-full lg:w-[380px]">
              <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
                <div className="h-64 rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {error || 'Dokter tidak ditemukan'}
            </h2>
            <Link href="/booking-dokter">
              <button className="rounded-lg bg-[#1D7CF3] px-6 py-2 text-white hover:bg-[#1565D8]">
                Kembali ke Daftar Dokter
              </button>
            </Link>
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
        {/* Back button */}
        <Link href="/booking-dokter">
          <motion.button
            whileHover={{ x: -4 }}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#1D7CF3]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Daftar Dokter</span>
          </motion.button>
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Section - Doctor Info & Practice Hours */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {/* Doctor Profile */}
              <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#EEF8FF]"
                >
                  <Image
                    src={doctor.user.profile_picture_url || "/images/assets/doctor-elipse.svg"}
                    alt={doctor.user.full_name}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {doctor.user.full_name}
                  </h1>
                  <p className="mt-1 text-gray-500">{doctor.specialization}</p>
                  
                  {doctor.alamat_praktek && (
                    <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                      <MapPin className="h-4 w-4 text-[#1D7CF3]" />
                      <span className="text-sm text-gray-600">{doctor.alamat_praktek}</span>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-400">Mulai dari</p>
                    <div className="flex items-center justify-center gap-1 sm:justify-start">
                      <DollarSign className="h-5 w-5 text-[#1D7CF3]" />
                      <p className="text-xl font-bold text-[#1D7CF3]">
                        {doctor.price_range || formatCurrency(parsePriceRange(doctor.price_range))}{" "}
                        <span className="text-base font-normal text-gray-800">/jam</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Hours */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">Jam praktik</h2>
                </div>

                {sortedDays.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
                    Belum ada jadwal praktik tersedia
                  </div>
                ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {sortedDays.map((day) => (
                    <motion.div
                      key={day}
                      variants={itemVariants}
                      className="overflow-hidden rounded-lg border border-gray-100"
                    >
                      <button
                        onClick={() => toggleDay(day)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-700">
                          {getDayName(day)}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedDay === day ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedDay === day && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2 px-4 pb-4">
                              {groupedSchedules[day]
                                .filter(s => s.is_active)
                                .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
                                .map((schedule) => (
                                <motion.span
                                  key={schedule.id}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="cursor-pointer rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#1D7CF3] hover:text-white"
                                >
                                  {schedule.time_slot.replace(':', '.')}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Section - Calendar & Time Selection */}
          <motion.div
            variants={calendarVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-[400px]"
          >
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {/* Calendar Header */}
              <div className="mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1D7CF3]" />
                <h2 className="text-lg font-bold text-gray-800">Pilih tanggal</h2>
              </div>

              {/* Month Navigation */}
              <div className="mb-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevMonth}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <h3 className="text-base font-semibold text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextMonth}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Day Names */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-semibold text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="mb-6 grid grid-cols-7 gap-1">
                {calendarDays.map((dateInfo, index) => {
                  const isSelected = selectedDate?.toDateString() === dateInfo.date.toDateString();
                  const hasSchedule = hasScheduleOnDate(dateInfo.date);
                  const isPast = isPastDate(dateInfo.date);
                  const isDisabled = !dateInfo.isCurrentMonth || isPast || !hasSchedule;
                  
                  return (
                  <motion.button
                    key={index}
                    whileHover={!isDisabled ? { scale: 1.1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => dateInfo.isCurrentMonth && handleDateSelect(dateInfo.date)}
                    disabled={isDisabled}
                    className={`aspect-square rounded-full p-2 text-sm font-medium transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed text-gray-300"
                        : isSelected
                        ? "bg-[#1D7CF3] text-white"
                        : hasSchedule
                        ? "text-gray-700 hover:bg-[#EEF8FF] ring-1 ring-[#1D7CF3] ring-opacity-30"
                        : "text-gray-400"
                    }`}
                  >
                    {dateInfo.day}
                  </motion.button>
                  );
                })}
              </div>

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="mb-6 rounded-lg bg-[#EEF8FF] p-3 text-center">
                  <p className="text-sm text-gray-600">
                    Tanggal dipilih:{" "}
                    <span className="font-semibold text-[#1D7CF3]">
                      {selectedDate.toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </p>
                </div>
              )}

              {/* Time Selection */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">Pilih waktu</h2>
                </div>

                {!selectedDate ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
                    Pilih tanggal terlebih dahulu
                  </div>
                ) : loadingSlots ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1D7CF3] border-t-transparent" />
                    <span className="text-gray-500">Memuat slot tersedia...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
                    Tidak ada slot tersedia pada tanggal ini
                  </div>
                ) : (
                <div className="flex flex-wrap gap-2">
                  {availableSlots
                    .filter(slot => slot.is_available)
                    .map((slot) => (
                    <motion.button
                      key={slot.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTimeSelect(slot)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedTime === slot.time_slot
                          ? "border-[#1D7CF3] bg-[#1D7CF3] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#1D7CF3] hover:text-[#1D7CF3]"
                      }`}
                    >
                      {slot.time_slot.replace(':', '.')}
                    </motion.button>
                  ))}
                </div>
                )}
              </div>

              {/* Booking Button */}
              <motion.button
                whileHover={selectedDate && selectedTime ? { scale: 1.02 } : {}}
                whileTap={selectedDate && selectedTime ? { scale: 0.98 } : {}}
                onClick={handleProceedBooking}
                disabled={!selectedDate || !selectedTime || !selectedSchedule}
                className={`w-full rounded-full py-3.5 text-base font-semibold transition-colors ${
                  selectedDate && selectedTime && selectedSchedule
                    ? "bg-[#1D7CF3] text-white hover:bg-[#1565D8]"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
              >
                {!selectedDate 
                  ? "Pilih tanggal terlebih dahulu"
                  : !selectedTime
                  ? "Pilih waktu terlebih dahulu"
                  : "Lanjut ke Konfirmasi"
                }
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

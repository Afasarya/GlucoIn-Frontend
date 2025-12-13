"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/common/Navbar";

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

// Mock doctor data
const doctorData = {
  id: 1,
  name: "Shenina Almore",
  specialty: "Spesialis Endokrin",
  price: "Rp250.000",
  image: "/images/assets/doctor-elipse.svg",
  practiceHours: [
    { day: "Senin", times: ["10.00", "11.00", "12.00", "14.00", "15.00", "16.00"] },
    { day: "Selasa", times: ["10.00", "11.00", "12.00", "14.00", "15.00", "16.00"] },
    { day: "Rabu", times: ["10.00", "11.00", "12.00", "14.00", "15.00", "16.00"] },
    { day: "Kamis", times: ["10.00", "11.00", "12.00", "14.00", "15.00", "16.00"] },
    { day: "Jumat", times: ["10.00", "11.00", "12.00", "14.00", "15.00", "16.00"] },
  ],
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

export default function BookingDetailPage() {
  const [expandedDay, setExpandedDay] = useState<string | null>("Selasa");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 18)); // December 18, 2025
  const [selectedDate, setSelectedDate] = useState<number>(18);
  const [selectedTime, setSelectedTime] = useState<string>("12.00");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(0);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(0);
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPast: true,
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isPast: false,
    });
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isPast: false,
    });
  }

  const availableTimes = ["10.00", "11.00", "12.00", "14.00"];

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
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
              <div className="mb-8 flex items-start gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#EEF8FF]"
                >
                  <Image
                    src={doctorData.image}
                    alt={doctorData.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {doctorData.name}
                  </h1>
                  <p className="mt-1 text-gray-500">{doctorData.specialty}</p>
                  <p className="mt-2 text-sm text-gray-400">Mulai dari</p>
                  <p className="text-xl font-bold text-[#1D7CF3]">
                    {doctorData.price}{" "}
                    <span className="text-base font-normal text-gray-800">/jam</span>
                  </p>
                </div>
              </div>

              {/* Practice Hours */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">Jam praktik</h2>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {doctorData.practiceHours.map((schedule) => (
                    <motion.div
                      key={schedule.day}
                      variants={itemVariants}
                      className="overflow-hidden rounded-lg border border-gray-100"
                    >
                      <button
                        onClick={() => toggleDay(schedule.day)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-700">
                          {schedule.day}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedDay === schedule.day ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedDay === schedule.day && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-2 px-4 pb-4">
                              {schedule.times.map((time) => (
                                <motion.span
                                  key={time}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="cursor-pointer rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#1D7CF3] hover:text-white"
                                >
                                  {time}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - Calendar & Time Selection */}
          <motion.div
            variants={calendarVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-[380px]"
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
                {calendarDays.map((dateInfo, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (dateInfo.isCurrentMonth) {
                        setSelectedDate(dateInfo.day);
                      }
                    }}
                    className={`aspect-square rounded-full p-2 text-sm font-medium transition-colors ${
                      dateInfo.isCurrentMonth
                        ? selectedDate === dateInfo.day
                          ? "bg-[#1D7CF3] text-white"
                          : "text-gray-700 hover:bg-[#EEF8FF]"
                        : "text-gray-300"
                    }`}
                  >
                    {dateInfo.day}
                  </motion.button>
                ))}
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1D7CF3]" />
                  <h2 className="text-lg font-bold text-gray-800">Pilih waktu</h2>
                </div>

                <div className="flex items-center gap-2">
                  {availableTimes.map((time) => (
                    <motion.button
                      key={time}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTime(time)}
                      className={`relative rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? "border-[#1D7CF3] bg-[#1D7CF3] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#1D7CF3] hover:text-[#1D7CF3]"
                      }`}
                    >
                      {time}
                    </motion.button>
                  ))}
                  {/* Dotted line indicator for more times */}
                  <span className="mx-2 flex-1 border-b-2 border-dashed border-gray-200"></span>
                </div>
              </div>

              {/* Booking Button */}
              <Link href={`/booking-dokter/${doctorData.id}/confirm`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-full bg-[#1D7CF3] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
                >
                  Booking
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

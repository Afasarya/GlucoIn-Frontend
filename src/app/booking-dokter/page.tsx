"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, DollarSign, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";

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

// Mock data for doctors
const doctorsData = [
  {
    id: 1,
    name: "Shenina Almore",
    specialty: "Spesialis Endokrin",
    location: "Jl.Prof Sudarto, Tembalang, Kota Semarang",
    price: "Rp250.000/jam",
    image: "/images/assets/doctor-elipse.svg",
  },
  {
    id: 2,
    name: "Shenina Almore",
    specialty: "Spesialis Endokrin",
    location: "Jl.Prof Sudarto, Tembalang, Kota Semarang",
    price: "Rp250.000/jam",
    image: "/images/assets/doctor-elipse.svg",
  },
  {
    id: 3,
    name: "Shenina Almore",
    specialty: "Spesialis Endokrin",
    location: "Jl.Prof Sudarto, Tembalang, Kota Semarang",
    price: "Rp250.000/jam",
    image: "/images/assets/doctor-elipse.svg",
  },
];

const priceRanges = [
  { id: "price1", label: "<100.000", value: "0-100000" },
  { id: "price2", label: "100.000 - 150.000", value: "100000-150000" },
  { id: "price3", label: "150.000 - 200.000", value: "150000-200000" },
  { id: "price4", label: ">200.000", value: "200000+" },
];

const ratingOptions = [
  { id: "rating5", label: "5", value: 5 },
  { id: "rating4", label: "4", value: 4 },
  { id: "rating3", label: "<3", value: 3 },
];

export default function BookingDokterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKota, setSelectedKota] = useState("");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const handlePriceRangeChange = (value: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleRatingChange = (value: number) => {
    setSelectedRatings((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

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

              {/* Lokasi Section */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#1D7CF3]" />
                  <span className="font-semibold text-gray-800">Lokasi</span>
                </div>

                {/* Provinsi Dropdown */}
                <div className="mb-3">
                  <select
                    value={selectedProvinsi}
                    onChange={(e) => setSelectedProvinsi(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
                  >
                    <option value="">Provinsi</option>
                    <option value="jawa-tengah">Jawa Tengah</option>
                    <option value="jawa-barat">Jawa Barat</option>
                    <option value="jawa-timur">Jawa Timur</option>
                    <option value="dki-jakarta">DKI Jakarta</option>
                  </select>
                </div>

                {/* Kota Dropdown */}
                <div>
                  <select
                    value={selectedKota}
                    onChange={(e) => setSelectedKota(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#1D7CF3] focus:ring-1 focus:ring-[#1D7CF3]"
                  >
                    <option value="">Kota</option>
                    <option value="semarang">Semarang</option>
                    <option value="bandung">Bandung</option>
                    <option value="surabaya">Surabaya</option>
                    <option value="jakarta">Jakarta</option>
                  </select>
                </div>
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
                        checked={selectedPriceRanges.includes(range.value)}
                        onChange={() => handlePriceRangeChange(range.value)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1D7CF3] focus:ring-[#1D7CF3]"
                      />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="mb-6 border-gray-100" />

              {/* Rating Dokter Section */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#1D7CF3]" />
                  <span className="font-semibold text-gray-800">
                    Rating Dokter
                  </span>
                </div>

                <div className="space-y-3">
                  {ratingOptions.map((rating) => (
                    <label
                      key={rating.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating.value)}
                        onChange={() => handleRatingChange(rating.value)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1D7CF3] focus:ring-[#1D7CF3]"
                      />
                      <span className="text-sm text-gray-600">{rating.label}</span>
                    </label>
                  ))}
                </div>
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
            <div className="space-y-4">
              {doctorsData.map((doctor) => (
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
                        src={doctor.image}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>

                  {/* Doctor Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="mb-1 text-sm text-gray-500">
                      {doctor.specialty}
                    </p>
                    <h3 className="mb-3 text-xl font-bold text-gray-800">
                      {doctor.name}
                    </h3>

                    <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                      <MapPin className="h-4 w-4 text-[#1D7CF3]" />
                      <span className="text-sm text-gray-600">
                        {doctor.location}
                      </span>
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-2 sm:justify-start">
                      <DollarSign className="h-4 w-4 text-[#1D7CF3]" />
                      <span className="text-sm text-gray-600">
                        Mulai dari {doctor.price}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-3 sm:justify-start">
                      <Link href={`/booking-dokter/${doctor.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="rounded-full bg-[#1D7CF3] px-16 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

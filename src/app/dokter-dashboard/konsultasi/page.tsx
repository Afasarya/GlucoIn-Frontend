"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ChevronDown, List, LayoutGrid, ArrowRight } from "lucide-react";
import { useState } from "react";

// Types
interface Konsultasi {
  id: string;
  patientName: string;
  patientAge: string;
  jadwalTanggal: string;
  jadwalWaktu: string;
  jenisPemeriksaan: string;
  status: "mendatang" | "selesai";
}

interface StatsData {
  konsultasiHariIni: number;
  semuaKonsultasi: number;
  konsultasiBulanIni: number;
  konsultasiSelesai: number;
}

// Default data
const defaultKonsultasi: Konsultasi[] = [
  {
    id: "1",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "mendatang",
  },
  {
    id: "2",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "mendatang",
  },
  {
    id: "3",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "mendatang",
  },
  {
    id: "4",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "selesai",
  },
  {
    id: "5",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "selesai",
  },
  {
    id: "6",
    patientName: "Erna Handayani",
    patientAge: "42 tahun",
    jadwalTanggal: "18 Desember 2025",
    jadwalWaktu: "10.00 - 11.00",
    jenisPemeriksaan: "Langsung ke tempat",
    status: "selesai",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Stats Card Component
function StatsCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white p-5">
      <p className="text-2xl font-bold text-gray-800 lg:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Konsultasi Card Component
function KonsultasiCard({ konsultasi }: { konsultasi: Konsultasi }) {
  return (
    <Link href={`/dokter-dashboard/konsultasi/${konsultasi.id}`}>
      <motion.div
        variants={itemVariants}
        className="cursor-pointer rounded-2xl bg-white p-5 transition-shadow hover:shadow-md"
      >
        {/* Header - Avatar, Name, Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src="/images/assets/patient-avatar.svg"
                alt={konsultasi.patientName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{konsultasi.patientName}</p>
              <p className="text-sm text-gray-500">{konsultasi.patientAge}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              konsultasi.status === "mendatang"
                ? "bg-orange-50 text-[#F97316]"
                : "bg-green-50 text-green-600"
            }`}
          >
            {konsultasi.status}
          </span>
        </div>

        {/* Jadwal Pemeriksaan */}
        <div className="mt-5">
          <p className="text-sm text-gray-500">Jadwal Pemeriksaan</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {konsultasi.jadwalTanggal} · {konsultasi.jadwalWaktu}
          </p>
        </div>

        {/* Jenis Pemeriksaan */}
        <div className="mt-4">
          <p className="text-sm text-gray-500">Jenis Pemeriksaan</p>
          <p className="mt-1 text-sm font-medium text-[#1D7CF3]">
            {konsultasi.jenisPemeriksaan}
          </p>
        </div>

        {/* Chat Button */}
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D7CF3] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]">
          Chat
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </Link>
  );
}

export default function KonsultasiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Hari Ini");
  const [sortBy, setSortBy] = useState("Nama A-Z");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [konsultasiData] = useState<Konsultasi[]>(defaultKonsultasi);
  const [stats] = useState<StatsData>({
    konsultasiHariIni: 6,
    semuaKonsultasi: 126,
    konsultasiBulanIni: 31,
    konsultasiSelesai: 120,
  });

  const filters = ["Hari Ini", "Mendatang", "Selesai", "Semua"];
  const sortOptions = ["Nama A-Z", "Nama Z-A", "Terbaru", "Terlama"];

  // Filter konsultasi based on active filter
  const filteredKonsultasi = konsultasiData.filter((k) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Hari Ini") return true; // For demo, show all
    if (activeFilter === "Mendatang") return k.status === "mendatang";
    if (activeFilter === "Selesai") return k.status === "selesai";
    return true;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search and Filter Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5"
      >
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari dari nama atau tanggal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#1D7CF3] focus:outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            {sortBy}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isSortOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    sortBy === option
                      ? "bg-[#EEF8FF] text-[#1D7CF3]"
                      : "text-gray-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs and View Toggle */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-[#1D7CF3] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-gray-100 text-gray-800"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatsCard value={stats.konsultasiHariIni} label="Konsultasi hari ini" />
        <StatsCard value={stats.semuaKonsultasi} label="Semua konsultasi" />
        <StatsCard value={stats.konsultasiBulanIni} label="Konsultasi bulan ini" />
        <StatsCard value={stats.konsultasiSelesai} label="Konsultasi selesai" />
      </motion.div>

      {/* Konsultasi Cards Grid */}
      <motion.div
        variants={containerVariants}
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {filteredKonsultasi.map((konsultasi) => (
          <KonsultasiCard key={konsultasi.id} konsultasi={konsultasi} />
        ))}
      </motion.div>
    </motion.div>
  );
}

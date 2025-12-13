"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, Info, X, Plus } from "lucide-react";
import { useState } from "react";

// Types
interface PatientData {
  id: string;
  name: string;
  age: string;
  avatar: string;
  tanggalLahir: string;
  gender: string;
  alamat: string;
  golonganDarah: string;
  tekananDarah: string;
  alergi: string;
}

interface RiwayatPemeriksaan {
  id: string;
  tanggal: string;
  waktu: string;
  tipe: "Online" | "Offline";
  kondisi: string;
  pemeriksaan: string;
  dokter: string;
  catatan: string;
  hasilLab: string;
}

interface HasilPemeriksaanForm {
  jenisTesDarah: string;
  kadarGula: string;
  kondisi: string;
  obat: string[];
  catatan: string;
}

// Default data
const defaultPatient: PatientData = {
  id: "1",
  name: "Erna Handayani",
  age: "42 tahun",
  avatar: "/images/assets/patient-avatar.svg",
  tanggalLahir: "2 Februari 1982",
  gender: "Perempuan",
  alamat: "Jl. Prof Sudarto no 12, Tembalang, Kota Semarang",
  golonganDarah: "-",
  tekananDarah: "-",
  alergi: "-",
};

const defaultRiwayat: RiwayatPemeriksaan[] = [
  {
    id: "1",
    tanggal: "12 Desember 2025",
    waktu: "10.00 - 11.00",
    tipe: "Online",
    kondisi: "Mengkhawatirkan",
    pemeriksaan: "Analisis hasil lab",
    dokter: "Dr. Alia Rahma",
    catatan: "Kondisi sekarang lebih buruk dibanding hasil lab 14 hari yang lalu",
    hasilLab: "Hasil lab 21-12-2025.pdf",
  },
  {
    id: "2",
    tanggal: "12 Desember 2025",
    waktu: "10.00 - 11.00",
    tipe: "Online",
    kondisi: "Mengkhawatirkan",
    pemeriksaan: "Analisis hasil lab",
    dokter: "Dr. Alia Rahma",
    catatan: "Kondisi sekarang lebih buruk dibanding hasil lab 14 hari yang lalu",
    hasilLab: "Hasil lab 01-12-2025.pdf",
  },
  {
    id: "3",
    tanggal: "12 Desember 2025",
    waktu: "10.00 - 11.00",
    tipe: "Online",
    kondisi: "Mengkhawatirkan",
    pemeriksaan: "Analisis hasil lab",
    dokter: "Dr. Alia Rahma",
    catatan: "Kondisi sekarang lebih buruk dibanding hasil lab 14 hari yang lalu",
    hasilLab: "Hasil lab 11-11-2025.pdf",
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

// Tab types
type TabType = "informasi" | "riwayat" | "hasil";

// Informasi Pasien Tab Component
function InformasiPasienTab({ patient }: { patient: PatientData }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Data Pasien */}
      <motion.div variants={itemVariants}>
        <h3 className="mb-4 text-sm font-semibold text-[#1D7CF3]">Data Pasien</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Tanggal lahir</p>
            <p className="mt-1 font-medium text-gray-800">{patient.tanggalLahir}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="mt-1 font-medium text-gray-800">{patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="mt-1 font-medium text-gray-800">{patient.alamat}</p>
          </div>
        </div>
      </motion.div>

      {/* Data Kesehatan */}
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="mb-4 text-sm font-semibold text-[#1D7CF3]">Data Kesehatan</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Golongan Darah</p>
            <p className="mt-1 font-medium text-gray-800">{patient.golonganDarah}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tekanan Darah</p>
            <p className="mt-1 font-medium text-gray-800">{patient.tekananDarah}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alergi</p>
            <p className="mt-1 font-medium text-gray-800">{patient.alergi}</p>
          </div>
        </div>
      </motion.div>

      {/* Edit Data Button */}
      <motion.div variants={itemVariants} className="mt-8">
        <button className="rounded-lg bg-[#1D7CF3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]">
          Edit Data
        </button>
      </motion.div>
    </motion.div>
  );
}

// Riwayat Pemeriksaan Tab Component
function RiwayatPemeriksaanTab({ riwayat }: { riwayat: RiwayatPemeriksaan[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-6"
    >
      {/* Left Side - Hasil Lab */}
      <motion.div variants={itemVariants} className="w-48 flex-shrink-0">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Hasil Lab</h3>
        <div className="space-y-4">
          {riwayat.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <div className="relative h-24 w-full bg-gray-100">
                {/* PDF Preview Placeholder */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-1 h-8 w-8 rounded bg-green-100 p-1">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                {/* Download Button */}
                <button className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1D7CF3] text-white">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-white p-2">
                <FileText className="h-4 w-4 text-red-500" />
                <span className="text-xs text-gray-600">{item.hasilLab}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Side - Riwayat Cards */}
      <div className="flex-1 space-y-4">
        {riwayat.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="rounded-xl border border-gray-100 bg-white p-5"
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-semibold text-gray-800">{item.tanggal}</span>
              <span className="text-sm text-gray-500">{item.waktu}</span>
              <span className="text-sm font-medium text-[#1D7CF3]">{item.tipe}</span>
            </div>

            {/* Details */}
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Kondisi</p>
                <p className="mt-1 font-medium text-gray-800">{item.kondisi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pemeriksaan</p>
                <p className="mt-1 font-medium text-gray-800">{item.pemeriksaan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dokter</p>
                <p className="mt-1 font-medium text-gray-800">{item.dokter}</p>
              </div>
            </div>

            {/* Catatan */}
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <p className="text-sm text-gray-600">{item.catatan}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Hasil Pemeriksaan Tab Component
function HasilPemeriksaanTab() {
  const [formData, setFormData] = useState<HasilPemeriksaanForm>({
    jenisTesDarah: "HbA1c",
    kadarGula: "7,5",
    kondisi: "Pre-Diabetes",
    obat: ["Metformin", "Sulfonilurea", "Meglitinide"],
    catatan: "",
  });
  const [isAddingObat, setIsAddingObat] = useState(false);
  const [newObat, setNewObat] = useState("");

  const handleAddObat = () => {
    if (newObat.trim()) {
      setFormData((prev) => ({
        ...prev,
        obat: [...prev.obat, newObat.trim()],
      }));
      setNewObat("");
      setIsAddingObat(false);
    }
  };

  const handleRemoveObat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      obat: prev.obat.filter((_, i) => i !== index),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddObat();
    } else if (e.key === "Escape") {
      setIsAddingObat(false);
      setNewObat("");
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Warning Alert */}
      <motion.div
        variants={itemVariants}
        className="mb-6 flex items-start gap-3 rounded-lg bg-[#EEF8FF] p-4"
      >
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1D7CF3]" />
        <div>
          <p className="font-medium text-[#1D7CF3]">
            Anda wajib mengisi hasil pemeriksaan
          </p>
          <p className="text-sm text-[#1D7CF3]/80">
            Lengkapi seluruh data hasil pemeriksaan pasien setelah konsultasi berakhir.
          </p>
        </div>
      </motion.div>

      {/* Hasil Lab Section */}
      <motion.div variants={itemVariants}>
        <h3 className="mb-4 text-sm font-semibold text-[#1D7CF3]">Hasil lab</h3>

        {/* Jenis Tes Gula Darah */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Jenis Tes Gula Darah
          </label>
          <select
            value={formData.jenisTesDarah}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, jenisTesDarah: e.target.value }))
            }
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
          >
            <option value="HbA1c">HbA1c</option>
            <option value="Gula Darah Puasa">Gula Darah Puasa</option>
            <option value="Gula Darah Sewaktu">Gula Darah Sewaktu</option>
            <option value="TTGO">TTGO</option>
          </select>
        </div>

        {/* Kadar Gula & Kondisi */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kadar Gula
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.kadarGula}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kadarGula: e.target.value }))
                }
                className="w-full max-w-[200px] rounded-l-lg border border-r-0 border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
              />
              <span className="rounded-r-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kondisi
            </label>
            <select
              value={formData.kondisi}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kondisi: e.target.value }))
              }
              className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="Pre-Diabetes">Pre-Diabetes</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Mengkhawatirkan">Mengkhawatirkan</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Obat Section */}
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="mb-4 text-sm font-semibold text-[#1D7CF3]">Obat</h3>

        {/* Add Obat Button / Input */}
        <div className="mb-4">
          {isAddingObat ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newObat}
                onChange={(e) => setNewObat(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newObat.trim()) {
                    setIsAddingObat(false);
                  }
                }}
                placeholder="Nama obat"
                autoFocus
                className="w-48 rounded-lg border border-[#1D7CF3] bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none"
              />
              <button
                onClick={handleAddObat}
                className="rounded-lg bg-[#1D7CF3] px-3 py-2 text-sm font-medium text-white hover:bg-[#1565D8]"
              >
                Tambah
              </button>
              <button
                onClick={() => {
                  setIsAddingObat(false);
                  setNewObat("");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingObat(true)}
              className="flex items-center gap-2 rounded-lg border border-dashed border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
            >
              <Plus className="h-4 w-4" />
              Tambah obat
            </button>
          )}
        </div>

        {/* Obat Tags */}
        <div className="flex flex-wrap gap-2">
          {formData.obat.map((obat, index) => (
            <span
              key={index}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
            >
              <button
                onClick={() => handleRemoveObat(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {obat}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Catatan Section */}
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="mb-4 text-sm font-semibold text-[#1D7CF3]">Catatan</h3>
        <textarea
          value={formData.catatan}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, catatan: e.target.value }))
          }
          placeholder="Kondisi detail pasien"
          rows={4}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
        />
      </motion.div>

      {/* Simpan Button */}
      <motion.div variants={itemVariants} className="mt-8">
        <button className="rounded-lg bg-[#1D7CF3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]">
          Simpan
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function DetailPasienPage() {
  const [activeTab, setActiveTab] = useState<TabType>("informasi");
  const [patient] = useState<PatientData>(defaultPatient);
  const [riwayat] = useState<RiwayatPemeriksaan[]>(defaultRiwayat);

  const tabs = [
    { id: "informasi" as TabType, label: "Informasi Pasien" },
    { id: "riwayat" as TabType, label: "Riwayat Pemeriksaan" },
    { id: "hasil" as TabType, label: "Hasil Pemeriksaan" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-white p-6 lg:p-8"
    >
      {/* Patient Header */}
      <motion.div variants={itemVariants} className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full">
          <Image
            src={patient.avatar}
            alt={patient.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-gray-500">{patient.age}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="mb-6 border-b border-gray-100">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D7CF3]"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "informasi" && <InformasiPasienTab patient={patient} />}
        {activeTab === "riwayat" && <RiwayatPemeriksaanTab riwayat={riwayat} />}
        {activeTab === "hasil" && <HasilPemeriksaanTab />}
      </div>
    </motion.div>
  );
}

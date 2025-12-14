"use client";

import { useState, useEffect, use, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBookingById, Booking } from "@/lib/api/dashboard";

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

// Demo lab results data
const demoLabResults = [
  {
    jenis: "Gula Darah Puasa",
    hasil: "168 mg/dL",
    keterangan: "Diabetes tidak terkontrol",
  },
  {
    jenis: "Gula Darah 2 Jam",
    hasil: "260 mg/dL",
    keterangan: "Kadar gula darah naik sangat tinggi setelah makan.",
  },
  {
    jenis: "HbA1c",
    hasil: "8.7%",
    keterangan: "tinggi risiko komplikasi",
  },
  {
    jenis: "Hemoglobin",
    hasil: "11.8 g/dL",
    keterangan: "Anemia ringan akibat nefropati",
  },
];

const demoMedications = ["Metformin", "Sulfonilurea", "Meglitinide"];

export default function DetailKonsultasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("Tetap pertahankan pola makan seimbang dan aktivitas fisik rutin yaa");

  const fetchBookingDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookingById(id);
      setBooking(data);
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching booking detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Memuat detail konsultasi...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link
          href="/dashboard/konsultasi"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
      </motion.div>

      {/* Doctor Info */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src="/images/avatars/doctor-placeholder.png"
              alt={booking?.doctor?.name || "Doctor"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {booking?.doctor?.name || "Dr. Teresa Chatur"}
            </h1>
            <p className="text-gray-500">
              {booking?.doctor?.specialization || "Endokrinolog"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Lab Results */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1D7CF3]">Hasil lab</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-sm font-medium text-gray-500">
                  Jenis Pemeriksaan
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-500">
                  Hasil
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-500">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demoLabResults.map((result, index) => (
                <tr key={index}>
                  <td className="py-4 text-sm text-gray-800">{result.jenis}</td>
                  <td className="py-4 text-sm text-gray-800">{result.hasil}</td>
                  <td className="py-4 text-sm text-gray-600">{result.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Medications */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1D7CF3]">Obat</h2>
        <div className="flex flex-wrap gap-2">
          {demoMedications.map((med, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#1D7CF3]"
            >
              {med}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div variants={itemVariants} className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1D7CF3]">Catatan</h2>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-gray-700">{notes}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

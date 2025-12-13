"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Detection options
const detectionOptions = [
  {
    id: "no-history",
    title: "Belum Punya Riwayat Diabetes",
    description:
      "Yuk kenali kondisi tubuhmu lewat screening awal lewat foto kuku/lidah & pertanyaan singkat",
    icon: "/images/assets/daun.svg",
    href: "/deteksi-dini/screening",
  },
  {
    id: "has-history",
    title: "Sudah Punya Riwayat Diabetes",
    description:
      "Unggah hasil labmu supaya sistem bisa membuat rencana yang paling sesuai untuk kondisimu.",
    icon: "/images/assets/jaringansaraf.svg",
    href: "/deteksi-dini/upload",
  },
];

export default function DeteksiDiniPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF8FF]">
      {/* Background decorative elements - subtle blue circles like in figma */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Top right blur */}
        <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-[#C5E4FF] opacity-60 blur-[100px]" />
        {/* Bottom left blur */}
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-[#C5E4FF] opacity-50 blur-[120px]" />
        {/* Center bottom blur */}
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#D4EDFF] opacity-40 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <div className="bg-white">
          <Navbar />
        </div>

        {/* Main Content - centered vertically */}
        <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col items-center"
          >
            {/* Title Section */}
            <motion.div variants={itemVariants} className="mb-16 text-center">
              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                Mulai dengan Pilihan yang Sesuai Kondisimu
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-400 sm:text-base">
                Pilih kondisi yang paling menggambarkan dirimu agar GlucoIn bisa
                memberikan analisis dan rekomendasi yang lebih tepat.
              </p>
            </motion.div>

            {/* Cards Section */}
            <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
              {detectionOptions.map((option) => (
                <motion.div
                  key={option.id}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(29, 124, 243, 0.12)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-3xl border-2 border-[#7EC8F8] bg-white shadow-sm"
                >
                  {/* Card Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/images/assets/bgmain-carddeteksidini.svg"
                      alt=""
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-16 w-16 shrink-0"
                      >
                        <Image
                          src={option.icon}
                          alt={option.title}
                          fill
                          className="object-contain"
                        />
                      </motion.div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">
                          {option.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-6 pl-20">
                      <Link href={option.href}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-2 rounded-full bg-[#1D7CF3] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
                        >
                          Lanjut
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </Link>
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

"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    number: 1,
    icon: "/images/assets/screening-awal.png",
    title: "Isi Screening Awal",
    description:
      "Jawab beberapa pertanyaan sederhana untuk memetakan kondisi kesehatan dasar Anda.",
  },
  {
    number: 2,
    icon: "/images/assets/resiko-ai.png",
    title: "Cek Risiko Menggunakan AI",
    description:
      "Upload foto kuku atau lidah, lalu biarkan AI menganalisis potensi tanda awal diabetes.",
  },
  {
    number: 3,
    icon: "/images/assets/insight-profesional.png",
    title: "Dapatkan Hasil & Insight Personal",
    description:
      "Upload foto kuku atau lidah, lalu biarkan AI menganalisis potensi tanda awal diabetes.",
  },
  {
    number: 4,
    icon: "/images/assets/rekomendasi-harian.png",
    title: "Terima Rekomendasi Harian",
    description:
      "AI memberikan saran pola makan, aktivitas, dan kebiasaan sehat sesuai profil Anda.",
  },
  {
    number: 5,
    icon: "/images/assets/monitoring.png",
    title: "Pantau Perkembangan Anda",
    description:
      "Lihat grafik tren aktivitas, hasil lab, dan progres kesehatan Anda dari waktu ke waktu.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Workflow() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
          className="mb-12 text-center lg:mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Bagaimana <span className="text-[#D65519]">Glucoin</span> Bekerja?
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {steps.slice(0, 3).map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl bg-white p-6 transition-shadow lg:p-8"
              style={{ boxShadow: '0 4px 20px 0 #1D7CF317' }}
            >
              {/* Step Number */}
              <div className="absolute -top-3 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-bold text-white shadow-md">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-4 mt-2 h-12 w-12 lg:h-14 lg:w-14">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-gray-900 lg:text-xl">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Row - 2 Cards Centered */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-4xl"
        >
          {steps.slice(3, 5).map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl bg-white p-6 transition-shadow lg:p-8"
              style={{ boxShadow: '0 4px 20px 0 #1D7CF317' }}
            >
              {/* Step Number */}
              <div className="absolute -top-3 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-bold text-white shadow-md">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-4 mt-2 h-12 w-12 lg:h-14 lg:w-14">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-gray-900 lg:text-xl">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

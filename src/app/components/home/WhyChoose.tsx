"use client";

import { motion, Variants } from "framer-motion";
import { Search, Bot, Stethoscope } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Deteksi Dini Diabetes",
    description:
      "Upload foto kuku atau lidah, dan AI akan menganalisis tanda awal risiko diabetes secara cepat.",
  },
  {
    icon: Bot,
    title: "Asisten AI 24/7",
    description:
      "Upload foto kuku atau lidah, dan AI akan menganalisis tanda awal risiko diabetes secara cepat.",
  },
  {
    icon: Stethoscope,
    title: "Konsultasi Dokter",
    description:
      "Upload foto kuku atau lidah, dan AI akan menganalisis tanda awal risiko diabetes secara cepat.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function WhyChoose() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Wrapper with blue background */}
        <div className="rounded-3xl bg-[#EEF8FF] px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          {/* Section Title */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={titleVariants}
            className="mb-10 text-center lg:mb-14"
          >
            <h2 className="text-2xl font-bold text-[#1D7CF3] sm:text-3xl lg:text-4xl">
              Mengapa Memilih Glucoin?
            </h2>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:p-8"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF8FF] text-[#1D7CF3] transition-colors group-hover:bg-[#1D7CF3] group-hover:text-white lg:h-14 lg:w-14">
                  <feature.icon className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-lg font-bold text-gray-900 lg:text-xl">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

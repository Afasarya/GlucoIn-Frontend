"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

const containerVariants: Variants = {
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.2,
    },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.4,
    },
  },
};

export default function Cta() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="relative overflow-hidden rounded-3xl bg-[#EEF8FF]"
          style={{
            backgroundImage: "url('/images/assets/bg-cta.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-12 text-center sm:px-12 sm:py-16 lg:flex-row lg:justify-between lg:px-16 lg:py-12 lg:text-left">
            {/* Text Content */}
            <div className="max-w-2xl">
              <motion.h2
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl"
              >
                Siap Memulai Perjalanan Sehat Anda?
              </motion.h2>
              <motion.p
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-sm leading-relaxed text-gray-600 sm:text-base"
              >
                Dapatkan analisis AI, rekomendasi harian, dan insight kesehatan yang membantu Anda mengenal tubuh lebih baik.
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex-shrink-0"
            >
              <Link
                href="/deteksi-dini"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1D7CF3] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1565C0] hover:shadow-lg sm:px-8 sm:py-4 sm:text-base"
              >
                Mulai Screening Gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

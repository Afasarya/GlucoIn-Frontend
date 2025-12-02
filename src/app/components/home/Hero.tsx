"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Hero() {
  return (
    <section className="relative pb-16 pt-8 lg:pb-24 lg:pt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-[56px] xl:leading-[1.15]"
            >
              <span>Kenali Risiko </span>
              <span className="text-[#D65519]">Diabetes</span>
              <span>,</span>
              <br />
              <span>Jaga Diri Lebih Awal</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-base leading-relaxed text-gray-600 sm:text-lg lg:mt-8"
            >
              GlucoIn membantu mendeteksi tanda awal diabetes dan memberikan
              rekomendasi untuk menjaga kesehatan Anda setiap hari.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                href="/deteksi-dini"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#1D7CF3] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#1565C0] hover:shadow-lg lg:mt-10 lg:px-8 lg:py-4"
              >
                Mulai Screening
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Illustration */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative aspect-square w-full"
            >
              <Image
                src="/images/assets/home-hero.svg"
                alt="GlucoIn - Deteksi Diabetes"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

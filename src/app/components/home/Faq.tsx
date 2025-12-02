"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Apa itu GlucoIn?",
    answer:
      "GlucoIn adalah platform deteksi dini diabetes yang menggunakan teknologi AI untuk menganalisis risiko diabetes berdasarkan foto kuku atau lidah, serta memberikan rekomendasi kesehatan personal.",
  },
  {
    question: "Apakah GlucoIn bisa mendeteksi diabetes tanpa alat?",
    answer:
      "Ya, GlucoIn menggunakan teknologi AI canggih yang dapat menganalisis tanda-tanda awal diabetes melalui foto kuku atau lidah tanpa memerlukan alat medis khusus.",
  },
  {
    question: "Apakah hasil analisis GlucoIn akurat?",
    answer:
      "Hasil analisis GlucoIn memiliki tingkat akurasi yang tinggi berdasarkan penelitian dan pengembangan berkelanjutan. Namun, kami tetap menyarankan untuk berkonsultasi dengan dokter untuk diagnosis yang lebih akurat.",
  },
  {
    question: "Apakah GlucoIn bisa digunakan oleh orang yang sudah punya diabetes?",
    answer:
      "Ya, GlucoIn dapat membantu penderita diabetes untuk memantau kondisi kesehatan mereka dan mendapatkan rekomendasi gaya hidup sehat yang sesuai.",
  },
  {
    question: "Haruskah saya upload hasil laboratorium?",
    answer:
      "Upload hasil laboratorium bersifat opsional, namun dapat membantu AI memberikan analisis yang lebih akurat dan rekomendasi yang lebih personal.",
  },
  {
    question: "Apakah layanan ini gratis?",
    answer:
      "GlucoIn menyediakan layanan dasar gratis. Untuk fitur premium seperti konsultasi dokter dan analisis mendalam, tersedia paket berlangganan dengan harga terjangkau.",
  },
  {
    question: "Apakah data kesehatan saya aman?",
    answer:
      "Ya. Semua data disimpan dengan enkripsi dan hanya digunakan untuk kebutuhan analisis kesehatan sesuai kebijakan privasi.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(6); // Last item open by default as shown in design

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Left Side - Title and Illustration */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={imageVariants}
            className="flex flex-col items-center text-center lg:w-2/5 lg:items-start lg:text-left"
          >
            <h2 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Frequently Asked Questions
            </h2>

            {/* Illustration */}
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <Image
                src="/images/assets/Faq.svg"
                alt="FAQ Illustration"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Right Side - FAQ Accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="flex-1 lg:w-3/5"
          >
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="pr-4 text-sm font-semibold text-gray-900 sm:text-base">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="border-t border-gray-100 px-5 py-4">
                          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

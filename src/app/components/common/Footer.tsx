"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

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

const serviceLinks = [
  { href: "/deteksi-dini", label: "Deteksi Dini Diabetes (AI)" },
  { href: "/screening", label: "Screening Kuisioner" },
  { href: "/analisis-lab", label: "Analisis Hasil Lab" },
  { href: "/rekomendasi", label: "Rekomendasi Harian" },
  { href: "/konsultasi", label: "Konsultasi Dokter" },
];

const forYouLinks = [
  { href: "/cek-risiko", label: "Cek Risiko Diabetes" },
  { href: "/insight", label: "Lihat Insight Mingguan" },
  { href: "/progress", label: "Pantau Progress" },
];

const infoLinks = [
  { href: "/tentang", label: "Tentang GlucoIn" },
  { href: "/privasi", label: "Kebijakan Privasi" },
  { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
  { href: "/bantuan", label: "Bantuan & FAQ" },
];

export default function Footer() {
  return (
    <footer className="bg-[#EEF8FF] pb-6 pt-12">
      <div className="container mx-auto max-w-7xl px-6 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:gap-x-20"
        >
          {/* Service Column */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-base font-medium text-[#94A3B8]">
              Service
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#1E293B] transition-colors hover:text-[#1D7CF3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For You & Info Column */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-5 text-base font-medium text-[#94A3B8]">
              For You
            </h3>
            <ul className="space-y-3">
              {forYouLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#1E293B] transition-colors hover:text-[#1D7CF3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mb-5 mt-8 text-base font-medium text-[#94A3B8]">
              Info
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#1E293B] transition-colors hover:text-[#1D7CF3]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Logo & Contact Column */}
          <motion.div variants={itemVariants}>
            {/* Logo */}
            <div className="mb-5">
              <Image
                src="/images/assets/logo.svg"
                alt="Glucoin Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Contact */}
            <div className="space-y-1">
              <p className="text-[15px] text-[#1E293B]">+1 999 888-76-54</p>
              <p className="text-[15px] text-[#1E293B]">support@glucoin.com</p>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-4">
              <Link
                href="https://wa.me/1999888765"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] transition-colors hover:text-[#1D7CF3]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
              </Link>
              <Link
                href="https://t.me/glucoin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] transition-colors hover:text-[#1D7CF3]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Address & Hours Column */}
          <motion.div variants={itemVariants} className="text-left lg:text-right">
            <p className="text-[15px] leading-relaxed text-[#1E293B]">
              2972 Westheimer Rd. Santa Ana
            </p>
            <p className="text-[15px] text-[#1E293B]">Illinois 85486</p>
            <p className="mt-6 text-[15px] font-medium text-[#1E293B]">
              From 10 a.m. to 6 p.m.
            </p>
            <p className="text-[15px] text-[#64748B]">All days</p>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#CBD5E1]/40 pt-5 sm:flex-row"
        >
          <p className="text-sm text-[#94A3B8]">© 2025 — Copyright</p>
          <Link
            href="/privasi"
            className="text-sm text-[#94A3B8] transition-colors hover:text-[#1D7CF3]"
          >
            Privacy
          </Link>
        </motion.div>
      </div>
    </footer>
  );
}

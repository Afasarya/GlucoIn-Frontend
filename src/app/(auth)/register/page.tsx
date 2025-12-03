"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
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

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle register logic here
    console.log({ name, email, password });
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Register Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-20 xl:px-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto w-full max-w-md"
        >
          {/* Header */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-[#1E293B] lg:text-4xl"
          >
            Daftar
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-[15px] text-[#64748B]"
          >
            Sudah saatnya jaga kesehatan bersama Glucoin
          </motion.p>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#1E293B]"
              >
                Nama
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Zahira Mumtaz"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20"
                required
              />
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#1E293B]"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20"
                required
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#1E293B]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 pr-12 text-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#64748B]"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-lg bg-[#1D7CF3] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90 hover:shadow-xl hover:shadow-[#1D7CF3]/40"
            >
              Daftar
            </motion.button>
          </motion.form>

          {/* Login Link */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-[15px] text-[#64748B]"
          >
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1D7CF3] transition-colors hover:text-[#1D7CF3]/80"
            >
              Masuk
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={imageVariants}
        className="relative hidden lg:block lg:w-1/2"
      >
        <Image
          src="/images/assets/login-img.svg"
          alt="GlucoIn Register Illustration"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}

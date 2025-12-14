"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    try {
      const response = await forgotPassword({ email });
      setSuccess(response.message || "Link reset password telah dikirim ke email Anda");
      setEmail("");
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Forgot Password Form */}
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
            Lupa Password
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-[15px] text-[#64748B]"
          >
            Tenang, prosesnya cepat kok.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-[15px] text-[#64748B]"
          >
            Tinggal cek email, klik link reset, dan buat kata sandi baru.
          </motion.p>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                  setSuccess("");
                }}
                placeholder="user@gmail.com"
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20"
                required
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-600"
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all
                ${isLoading
                  ? "cursor-not-allowed bg-gray-400 shadow-none"
                  : "bg-[#1D7CF3] shadow-[#1D7CF3]/30 hover:bg-[#1D7CF3]/90 hover:shadow-xl hover:shadow-[#1D7CF3]/40"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Mengirim...
                </span>
              ) : (
                "Kirim Link Reset"
              )}
            </motion.button>
          </motion.form>

          {/* Back to Login Link */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-[15px] text-[#64748B]"
          >
            Sudah ingat password?{" "}
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
          alt="GlucoIn Forgot Password Illustration"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}

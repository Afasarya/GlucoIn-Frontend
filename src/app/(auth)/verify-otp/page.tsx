"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [success, setSuccess] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailInitialized = useRef(false);
  
  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuth();

  // Initialize email from sessionStorage after mount (client-side only)
  // This is necessary because sessionStorage is only available in the browser
  useEffect(() => {
    if (!emailInitialized.current) {
      emailInitialized.current = true;
      const storedEmail = sessionStorage.getItem("pending_verification_email");
      if (storedEmail) {
        // Use requestAnimationFrame to avoid sync setState warning
        requestAnimationFrame(() => {
          setEmail(storedEmail);
        });
      }
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleChange = useCallback((index: number, value: string) => {
    clearError();
    setSuccess("");
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp, clearError]);

  // Handle backspace
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < OTP_LENGTH) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }, [otp]);

  // Submit OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      return;
    }

    try {
      await verifyOtp({ email, otp: otpString });
    } catch {
      // Error is handled by the hook
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0 || !email) return;

    try {
      await resendOtp(email);
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setSuccess("Kode OTP baru telah dikirim ke email Anda");
    } catch {
      // Error is handled by the hook
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - OTP Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-20 xl:px-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto w-full max-w-md"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#1D7CF3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </motion.div>

          {/* Header */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-[#1E293B] lg:text-4xl"
          >
            Verifikasi Email
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-[15px] text-[#64748B]"
          >
            Masukkan 6 digit kode OTP yang telah dikirim ke
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-[15px] font-medium text-[#1D7CF3]"
          >
            {email || "email@example.com"}
          </motion.p>

          {/* OTP Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {/* OTP Input Fields */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`h-14 w-12 rounded-lg border-2 text-center text-xl font-bold transition-all
                      ${digit ? "border-[#1D7CF3] bg-[#1D7CF3]/5" : "border-[#E2E8F0] bg-white"}
                      ${error ? "border-red-400 bg-red-50" : ""}
                      focus:border-[#1D7CF3] focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]/20
                      text-[#1E293B] placeholder:text-[#94A3B8]`}
                    disabled={isLoading}
                  />
                ))}
              </div>
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
              whileHover={{ scale: isOtpComplete && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: isOtpComplete && !isLoading ? 0.98 : 1 }}
              type="submit"
              disabled={!isOtpComplete || isLoading}
              className={`w-full rounded-lg px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all
                ${isOtpComplete && !isLoading
                  ? "bg-[#1D7CF3] shadow-[#1D7CF3]/30 hover:bg-[#1D7CF3]/90 hover:shadow-xl hover:shadow-[#1D7CF3]/40"
                  : "cursor-not-allowed bg-gray-300 shadow-none"
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
                  Memverifikasi...
                </span>
              ) : (
                "Verifikasi"
              )}
            </motion.button>

            {/* Resend OTP */}
            <motion.div
              variants={itemVariants}
              className="text-center text-[15px] text-[#64748B]"
            >
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className={`inline-flex items-center gap-1 font-semibold transition-colors
                  ${countdown > 0 || isLoading
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#1D7CF3] hover:text-[#1D7CF3]/80"
                  }`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {countdown > 0 ? `Kirim ulang (${countdown}s)` : "Kirim ulang"}
              </button>
            </motion.div>
          </motion.form>
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
          alt="GlucoIn OTP Verification Illustration"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}

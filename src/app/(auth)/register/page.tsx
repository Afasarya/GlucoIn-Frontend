"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="flex min-h-screen">
      {/* Left Side - Register Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <h1 className="text-3xl font-bold text-[#1E293B] lg:text-4xl">
            Daftar
          </h1>
          <p className="mt-2 text-[15px] text-[#64748B]">
            Sudah saatnya jaga kesehatan bersama Glucoin
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Name Field */}
            <div>
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
            </div>

            {/* Email Field */}
            <div>
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
            </div>

            {/* Password Field */}
            <div>
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#1D7CF3] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90 hover:shadow-xl hover:shadow-[#1D7CF3]/40"
            >
              Daftar
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-[15px] text-[#64748B]">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#1D7CF3] transition-colors hover:text-[#1D7CF3]/80"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="/images/assets/login-img.svg"
          alt="GlucoIn Register Illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

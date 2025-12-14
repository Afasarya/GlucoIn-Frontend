"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { storage } from "@/lib/hooks/useAuth";
import type { User as UserType } from "@/lib/types/auth";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/asisten-ai", label: "Asisten AI" },
  { href: "/deteksi-dini", label: "Deteksi Dini" },
  { href: "/cari-faskes", label: "Cari Faskes" },
  { href: "/booking-dokter", label: "Booking Dokter" },
  { href: "/belanja", label: "Belanja" },
];

// Helper to get user initials
function getInitials(name: string): string {
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    const currentUser = storage.getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    storage.clear();
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  const isLoggedIn = !!user;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-50 w-full py-4 lg:py-6"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold text-gray-800 lg:text-2xl"
            >
              LOGO
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#1D7CF3] ${
                      isActive ? "text-[#1D7CF3]" : "text-gray-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Profile / Auth Buttons - Desktop */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            {isLoading ? (
              // Loading skeleton
              <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
            ) : isLoggedIn && user ? (
              // Logged in - show user profile
              <>
                <motion.button
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {user.full_name}
                  </span>
                  <motion.div
                    animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </motion.div>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-[#EEF8FF] hover:text-[#1D7CF3]"
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              // Not logged in - show auth buttons
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90 hover:shadow-xl hover:shadow-[#1D7CF3]/40"
                >
                  Daftar
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-xl bg-white shadow-lg lg:hidden"
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-[#EEF8FF] hover:text-[#1D7CF3] ${
                          isActive ? "bg-[#EEF8FF] text-[#1D7CF3]" : "text-gray-600"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* User Profile / Auth Buttons - Mobile */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                  className="mt-2 border-t border-gray-100 pt-4"
                >
                  {isLoggedIn && user ? (
                    // Logged in - show user profile
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                          {getInitials(user.full_name)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {user.full_name}
                        </span>
                      </div>
                      <Link
                        href="/dashboard"
                        className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-[#EEF8FF] hover:text-[#1D7CF3]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </>
                  ) : (
                    // Not logged in - show auth buttons
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className="block rounded-lg px-4 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Masuk
                      </Link>
                      <Link
                        href="/register"
                        className="block rounded-lg bg-[#1D7CF3] px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-[#1D7CF3]/30 transition-all hover:bg-[#1D7CF3]/90"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Daftar
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

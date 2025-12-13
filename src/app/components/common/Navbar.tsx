"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/asisten-ai", label: "Asisten AI" },
  { href: "/deteksi-dini", label: "Deteksi Dini" },
  { href: "/booking-dokter", label: "Booking Dokter" },
  { href: "/belanja", label: "Belanja" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
    // Handle logout logic here
    console.log("Logging out...");
    setIsProfileDropdownOpen(false);
  };

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

          {/* User Profile - Desktop with Dropdown */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <motion.button
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                HA
              </div>
              <span className="text-sm font-medium text-gray-800">
                Hanifa Akhilah
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
                    href="/dashboard/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-[#EEF8FF] hover:text-[#1D7CF3]"
                  >
                    <User className="h-4 w-4" />
                    Dashboard/Profile
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
                
                {/* User Profile - Mobile */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                  className="mt-2 border-t border-gray-100 pt-4"
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                      HA
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      Hanifa Akhilah
                    </span>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-[#EEF8FF] hover:text-[#1D7CF3]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Dashboard/Profile
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
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, ShoppingCart, Star, Minus, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";

// Navigation links for marketplace navbar
const navLinks = [
  { href: "/asisten-ai", label: "Asisten AI" },
  { href: "/deteksi-dini", label: "Deteksi Dini" },
  { href: "/booking-dokter", label: "Cari Faskes" },
  { href: "/booking-dokter", label: "Booking Dokter" },
  { href: "/belanja", label: "Belanja" },
];

// Product data (in real app, fetch from API based on id)
const productData = {
  id: "1",
  name: "Glimepiride 300 Tablet",
  description:
    "Glimepiride adalah obat antidiabetes oral golongan sulfonylurea yang membantu mengontrol kadar gula darah pada penderita diabetes melitus tipe 2. Produk ini biasanya digunakan sebagai terapi lanjutan bagi pasien yang tidak cukup terkontrol dengan diet dan olahraga.",
  image: "/images/assets/obat.svg",
  price: 45000,
  originalPrice: 60000,
  rating: 4.5,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Format price to Indonesian Rupiah
function formatPrice(price: number): string {
  return `Rp${price.toLocaleString("id-ID")}`;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("Glimepiride");
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleBuyNow = () => {
    // In real app, add to cart and navigate to checkout
    router.push("/belanja/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Dark Navbar Header */}
      <div className="bg-[#1E293B]">
        {/* Top Navbar */}
        <div className="container mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-white lg:text-2xl">
              LOGO
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => {
                const isActive = link.href === "/belanja";
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#1D7CF3] ${
                      isActive ? "text-[#1D7CF3]" : "text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                HA
              </div>
              <span className="hidden text-sm font-medium text-white md:block">
                Hanifa Akhilah
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 pb-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari barang"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]"
              />
            </div>

            {/* Location & Cart */}
            <div className="flex items-center gap-6">
              <div className="hidden items-center gap-2 text-white md:flex">
                <MapPin className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-400">Kirim ke</p>
                  <p className="text-sm font-medium">Tembalang, Kota Semarang</p>
                </div>
              </div>

              <button className="relative text-white">
                <ShoppingCart className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50"
          >
            <Image
              src={productData.image}
              alt={productData.name}
              fill
              className="object-contain p-8"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div variants={itemVariants} className="flex flex-col">
            {/* Product Name */}
            <h1 className="text-2xl font-bold text-gray-800 lg:text-3xl">
              {productData.name}
            </h1>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-gray-600 lg:text-base">
              {productData.description}
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <Star className="h-5 w-5 fill-gray-200 text-gray-200" />
              <span className="ml-2 text-sm font-medium text-[#F97316]">
                {productData.rating}
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-2xl font-bold text-[#1D7CF3] lg:text-3xl">
                {formatPrice(productData.price)}
              </span>
              <span className="text-lg text-[#F97316] line-through">
                {formatPrice(productData.originalPrice)}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="flex h-12 w-12 items-center justify-center text-base font-medium text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyNow}
              className="mt-8 w-full rounded-xl bg-[#1D7CF3] py-4 text-base font-semibold text-white transition-colors hover:bg-[#1565D8] lg:max-w-md"
            >
              Beli Sekarang
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

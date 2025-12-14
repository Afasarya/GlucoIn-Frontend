"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, ShoppingCart, Star, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getProducts, getCart } from "@/lib/api/marketplace";
import type { Product, Cart } from "@/lib/types/marketplace";
import { storage } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types/auth";

// Navigation links for marketplace navbar
const navLinks = [
  { href: "/asisten-ai", label: "Asisten AI" },
  { href: "/deteksi-dini", label: "Deteksi Dini" },
  { href: "/booking-dokter", label: "Cari Faskes" },
  { href: "/booking-dokter", label: "Booking Dokter" },
  { href: "/belanja", label: "Belanja" },
];

interface Voucher {
  id: string;
  title: string;
  discount: string;
  maxDiscount: string;
  description: string;
}

// Default vouchers (could be fetched from API in the future)
const defaultVouchers: Voucher[] = [
  {
    id: "1",
    title: 'Klik "Gunakan" untuk langsung dapat diskon',
    discount: "Diskon Akhir Tahun 20% s.d.",
    maxDiscount: "20rb",
    description: "Promo terbaik",
  },
  {
    id: "2",
    title: 'Klik "Gunakan" untuk langsung dapat diskon',
    discount: "Diskon Akhir Tahun 20% s.d.",
    maxDiscount: "20rb",
    description: "Promo terbaik",
  },
  {
    id: "3",
    title: 'Klik "Gunakan" untuk langsung dapat diskon',
    discount: "Diskon Akhir Tahun 20% s.d.",
    maxDiscount: "20rb",
    description: "Promo terbaik",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// Format price to Indonesian Rupiah
function formatPrice(price: number): string {
  return `Rp${price.toLocaleString("id-ID")}`;
}

// Voucher Card Component
function VoucherCard({ voucher }: { voucher: Voucher }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1D7CF3]/20 bg-white shadow-sm">
      {/* Header */}
      <div className="bg-[#1D7CF3] px-4 py-2.5 text-center">
        <p className="text-xs font-medium text-white">{voucher.title}</p>
      </div>

      {/* Content */}
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              %
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {voucher.discount}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-base font-bold text-gray-800">
            {voucher.maxDiscount}
          </p>
          <p className="mt-1 text-xs text-gray-500">{voucher.description}</p>
        </div>
        <button className="rounded-full border border-[#1D7CF3] px-5 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#1D7CF3] hover:text-white">
          Pakai
        </button>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/belanja/${product.id}`}>
      <motion.div
        variants={itemVariants}
        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 p-4">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src="/images/assets/obat.svg"
                alt={product.name}
                fill
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
          )}
          {product.discount_percent > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              -{product.discount_percent}%
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold text-[#F97316]">
              {formatPrice(product.final_price)}
            </span>
            {product.discount_percent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Sold & Rating */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{product.rating_count} Terjual</span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Stock Status */}
          {!product.in_stock && (
            <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Stok Habis
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function BelanjaPage() {
  // Auth state - use state to avoid hydration issues
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vouchers] = useState<Voucher[]>(defaultVouchers);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check auth on mount
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser();
    setIsAuthenticated(!!token && !!storedUser);
    setUser(storedUser);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getProducts({
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      });
      setProducts(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  // Fetch cart if authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.full_name) return "?";
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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
              {navLinks.map((link, index) => {
                const isActive = link.href === "/belanja";
                return (
                  <Link
                    key={`${link.label}-${index}`}
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
              {isAuthenticated ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                    {getUserInitials()}
                  </div>
                  <span className="hidden text-sm font-medium text-white md:block">
                    {user?.full_name || "User"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565D8]"
                >
                  Masuk
                </Link>
              )}
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

              <Link href="/belanja/checkout" className="relative text-white">
                <ShoppingCart className="h-6 w-6" />
                {cart && cart.total_items > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {cart.total_items}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section - Larger with overlapping vouchers */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-56 w-full overflow-hidden md:h-72 lg:h-80">
          <Image
            src="/images/assets/banner-marketplace.svg"
            alt="Promo Akhir Tahun"
            fill
            className="object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Banner Content */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white md:left-10 lg:left-16">
            <p className="text-sm font-medium opacity-90">12-28 Des</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl lg:text-4xl">
              PROMO AKHIR TAHUN
            </h1>
            <p className="mt-2 text-sm opacity-90 md:text-base">
              Dapatkan diskon hingga 20% untuk obat-obatan
            </p>
          </div>
        </div>

        {/* Voucher Section - Overlapping */}
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative -mt-16 z-10 grid grid-cols-1 gap-4 md:-mt-20 md:grid-cols-3"
          >
            {vouchers.map((voucher) => (
              <motion.div key={voucher.id} variants={itemVariants}>
                <VoucherCard voucher={voucher} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
            {debouncedSearch && (
              <p className="text-sm">
                Coba cari dengan kata kunci lain
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

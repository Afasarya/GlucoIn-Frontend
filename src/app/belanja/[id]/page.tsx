"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Package,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getProductById, addToCart, getCart } from "@/lib/api/marketplace";
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
  const params = useParams();
  const productId = params.id as string;
  
  // Auth state - use state to avoid hydration issues
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser();
    setIsAuthenticated(!!token && !!storedUser);
    setUser(storedUser);
  }, []);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProductById(productId);
      setProduct(response.data);
    } catch (err: unknown) {
      console.error("Error fetching product:", err);
      setError("Produk tidak ditemukan");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Fetch cart
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
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.quantity) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/belanja/" + productId);
      return;
    }
    if (!product) return;
    try {
      setIsAddingToCart(true);
      await addToCart({ product_id: product.id, quantity });
      await fetchCart();
      alert("Produk berhasil ditambahkan ke keranjang!");
    } catch (err: unknown) {
      console.error("Error adding to cart:", err);
      const error = err as { message?: string };
      alert(error.message || "Gagal menambahkan ke keranjang");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/belanja/" + productId);
      return;
    }
    if (!product) return;
    try {
      setIsAddingToCart(true);
      await addToCart({ product_id: product.id, quantity });
      router.push("/belanja/checkout");
    } catch (err: unknown) {
      console.error("Error adding to cart:", err);
      const error = err as { message?: string };
      alert(error.message || "Gagal menambahkan ke keranjang");
      setIsAddingToCart(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.full_name) return "?";
    return user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i < fullStars ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-gray-400" />
        <p className="text-lg font-medium text-gray-600">{error || "Produk tidak ditemukan"}</p>
        <Link href="/belanja" className="flex items-center gap-2 text-[#1D7CF3] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Belanja
        </Link>
      </div>
    );
  }

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
                <Link href="/login" className="rounded-lg bg-[#1D7CF3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1565D8]">
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 pb-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari barang"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    router.push(`/belanja?search=${searchQuery}`);
                  }
                }}
                className="w-full rounded-lg bg-white py-3 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D7CF3]"
              />
            </div>
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

      {/* Product Detail Content */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/belanja" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1D7CF3]">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <motion.div variants={itemVariants} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-contain p-8" unoptimized />
            ) : (
              <Image src="/images/assets/obat.svg" alt={product.name} fill className="object-contain p-8" />
            )}
            {product.discount_percent > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                -{product.discount_percent}%
              </span>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {product.category.replace("_", " ")}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-gray-800 lg:text-3xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
              <span className="text-sm font-medium text-[#F97316]">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.rating_count} ulasan)</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-2xl font-bold text-[#1D7CF3] lg:text-3xl">{formatPrice(product.final_price)}</span>
              {product.discount_percent > 0 && (
                <span className="text-lg text-[#F97316] line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800">Deskripsi</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
              </div>
            )}
            <div className="mt-6 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <Package className="h-4 w-4" />
                {product.in_stock ? `Stok: ${product.quantity}` : "Stok Habis"}
              </span>
            </div>
            {product.in_stock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center text-base font-medium text-gray-800">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.quantity} className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-400">Maks. {product.quantity}</span>
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleAddToCart} disabled={!product.in_stock || isAddingToCart} className="flex-1 rounded-xl border-2 border-[#1D7CF3] py-3 text-base font-semibold text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF] disabled:opacity-50 disabled:cursor-not-allowed">
                {isAddingToCart ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Tambah ke Keranjang"}
              </button>
              <button onClick={handleBuyNow} disabled={!product.in_stock || isAddingToCart} className="flex-1 rounded-xl bg-[#1D7CF3] py-3 text-base font-semibold text-white transition-colors hover:bg-[#1565D8] disabled:opacity-50 disabled:cursor-not-allowed">
                Beli Sekarang
              </button>
            </div>
          </motion.div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <motion.div variants={itemVariants} className="mt-12">
            <h2 className="text-xl font-bold text-gray-800">Ulasan ({product.reviews.length})</h2>
            <div className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Home,
} from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { getOrderById, getOrders } from "@/lib/api/marketplace";
import type { Order } from "@/lib/types/marketplace";
import { storage } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types/auth";

// Transaction status configuration
const TRANSACTION_STATUS_CONFIG: Record<
  string,
  { 
    title: string; 
    description: string; 
    color: string; 
    bgColor: string; 
    icon: typeof CheckCircle2;
    gradient: string;
  }
> = {
  settlement: {
    title: "Pembayaran Berhasil!",
    description: "Terima kasih! Pembayaran Anda telah berhasil diproses. Pesanan Anda akan segera diproses.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
  },
  capture: {
    title: "Pembayaran Berhasil!",
    description: "Terima kasih! Pembayaran Anda telah berhasil diproses. Pesanan Anda akan segera diproses.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
  },
  pending: {
    title: "Menunggu Pembayaran",
    description: "Pembayaran Anda sedang diproses. Mohon selesaikan pembayaran sesuai instruksi.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
    gradient: "from-amber-500 to-orange-600",
  },
  deny: {
    title: "Pembayaran Ditolak",
    description: "Maaf, pembayaran Anda ditolak. Silakan coba metode pembayaran lain.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
  },
  cancel: {
    title: "Pembayaran Dibatalkan",
    description: "Pembayaran telah dibatalkan. Anda dapat membuat pesanan baru.",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: XCircle,
    gradient: "from-gray-500 to-slate-600",
  },
  expire: {
    title: "Pembayaran Kedaluwarsa",
    description: "Waktu pembayaran telah habis. Silakan buat pesanan baru.",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: AlertCircle,
    gradient: "from-gray-500 to-slate-600",
  },
  failure: {
    title: "Pembayaran Gagal",
    description: "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
    gradient: "from-red-500 to-rose-600",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Format price to Indonesian Rupiah
function formatPrice(price: number): string {
  return `Rp${price.toLocaleString("id-ID")}`;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get query parameters from Midtrans callback
  const orderId = searchParams.get("order_id") || "";
  const statusCode = searchParams.get("status_code") || "";
  const transactionStatus = searchParams.get("transaction_status") || "";

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Order state
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = storage.getToken();
      const userData = storage.getUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsAuthChecking(false);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Fetch order details
  const fetchOrder = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // First try to fetch directly by order_id (which might be order_number from Midtrans)
      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch {
      // If direct fetch fails, try to find the order from user's orders list
      try {
        const ordersResponse = await getOrders({ limit: 50 });
        const foundOrder = ordersResponse.data.find(
          (o) => o.order_number === orderId || o.id === orderId
        );
        if (foundOrder) {
          setOrder(foundOrder);
        }
        // If still not found, that's okay - we just won't show order details
      } catch {
        // Silently fail - we'll just show the payment status without order details
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthChecking && isAuthenticated && orderId) {
      fetchOrder();
    } else if (!isAuthChecking && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthChecking, isAuthenticated, orderId, fetchOrder]);

  // Get status configuration
  const statusConfig = TRANSACTION_STATUS_CONFIG[transactionStatus] || {
    title: "Status Pembayaran",
    description: "Memuat informasi pembayaran...",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    icon: AlertCircle,
    gradient: "from-gray-500 to-slate-600",
  };

  const StatusIcon = statusConfig.icon;

  // Loading state
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#F97316] mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/assets/glucoin.svg"
                alt="Glucoin Logo"
                width={40}
                height={40}
              />
              <span className="text-xl font-bold text-gray-800">Glucoin</span>
            </Link>
            <Link
              href="/belanja"
              className="flex items-center gap-2 text-gray-600 hover:text-[#F97316] transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Kembali ke Toko</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          {/* Status Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Status Header */}
            <div className={`bg-gradient-to-r ${statusConfig.gradient} p-8 text-center text-white`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
              >
                <StatusIcon className="h-10 w-10" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {statusConfig.title}
              </h1>
              <p className="text-white/90 max-w-md mx-auto">
                {statusConfig.description}
              </p>
            </div>

            {/* Order Details */}
            <div className="p-6 md:p-8">
              {/* Order ID */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ID Pesanan</span>
                  <span className="font-mono text-sm font-medium text-gray-800">
                    {orderId}
                  </span>
                </div>
                {statusCode && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Status Code</span>
                    <span className={`font-mono text-sm font-medium ${
                      statusCode === "200" ? "text-green-600" : "text-gray-800"
                    }`}>
                      {statusCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Status Transaksi</span>
                  <span className={`text-sm font-medium capitalize ${statusConfig.color}`}>
                    {transactionStatus.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Order Info (if loaded) */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
                </div>
              ) : order ? (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="border border-gray-100 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#F97316]" />
                      Ringkasan Pesanan
                    </h3>
                    
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                            {item.product_snapshot?.image_url ? (
                              <Image
                                src={item.product_snapshot.image_url}
                                alt={item.product_name}
                                fill
                                className="object-contain p-1"
                                unoptimized
                              />
                            ) : (
                              <Image
                                src="/images/assets/obat.svg"
                                alt={item.product_name}
                                fill
                                className="object-contain p-1"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity}x @ {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-800">{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ongkos Kirim</span>
                        <span className="text-gray-800">{formatPrice(order.shipping_cost)}</span>
                      </div>
                      {order.admin_fee && order.admin_fee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Biaya Admin</span>
                          <span className="text-gray-800">{formatPrice(order.admin_fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                        <span className="text-gray-800">Total</span>
                        <span className="text-[#F97316]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Date */}
                  <p className="text-center text-sm text-gray-500">
                    Pesanan dibuat pada {formatDate(order.created_at)}
                  </p>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">
                    Silakan login untuk melihat detail pesanan
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                  >
                    Login
                  </Link>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {order && (
                  <Link
                    href={`/belanja/order/${order.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#EA580C] transition-colors"
                  >
                    <Package className="h-5 w-5" />
                    Lihat Detail Pesanan
                  </Link>
                )}
                <Link
                  href="/belanja"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Lanjut Belanja
                </Link>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F97316] transition-colors text-sm"
                >
                  <Home className="h-4 w-4" />
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              Ada kendala? Hubungi{" "}
              <a
                href="mailto:support@glucoin.com"
                className="text-[#F97316] hover:underline"
              >
                support@glucoin.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#F97316] mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

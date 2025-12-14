"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  ArrowLeft,
  Loader2,
  Copy,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getOrderById, cancelOrder, confirmDelivery } from "@/lib/api/marketplace";
import type { Order } from "@/lib/types/marketplace";
import { storage } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types/auth";

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

// Order status configuration
const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof Package }
> = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  PROCESSING: {
    label: "Diproses",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Package,
  },
  SHIPPED: {
    label: "Dikirim",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Truck,
  },
  DELIVERED: {
    label: "Sampai Tujuan",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Selesai",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
};

// Payment status configuration
const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  PAID: {
    label: "Lunas",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  FAILED: {
    label: "Gagal",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
};

// Navigation links
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
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser();
    setIsAuthenticated(!!token && !!storedUser);
    setUser(storedUser);
    setIsAuthChecking(false);
  }, []);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch (err: unknown) {
      console.error("Error fetching order:", err);
      const error = err as { message?: string };
      setError(error.message || "Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isAuthenticated && orderId && !isAuthChecking) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId, isAuthChecking, fetchOrder]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.push(`/login?redirect=/belanja/order/${orderId}`);
    }
  }, [isAuthenticated, isAuthChecking, orderId, router]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    try {
      setIsProcessing(true);
      await cancelOrder(orderId);
      fetchOrder();
    } catch (err: unknown) {
      console.error("Error cancelling order:", err);
      const error = err as { message?: string };
      alert(error.message || "Gagal membatalkan pesanan");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirm delivery
  const handleConfirmDelivery = async () => {
    if (!confirm("Konfirmasi bahwa pesanan sudah diterima?")) return;

    try {
      setIsProcessing(true);
      await confirmDelivery(orderId);
      fetchOrder();
    } catch (err: unknown) {
      console.error("Error confirming delivery:", err);
      const error = err as { message?: string };
      alert(error.message || "Gagal mengkonfirmasi penerimaan");
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy order number
  const handleCopyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.full_name) return "?";
    return user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (!isAuthenticated || isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-16 w-16 text-red-400" />
        <p className="text-lg font-medium text-gray-600">{error || "Pesanan tidak ditemukan"}</p>
        <div className="flex gap-3">
          <button
            onClick={fetchOrder}
            className="flex items-center gap-2 rounded-lg bg-[#1D7CF3] px-4 py-2 text-white hover:bg-[#1565D8]"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/belanja"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PROCESSING;
  const StatusIcon = statusConfig.icon;
  const paymentStatusConfig = order.payment
    ? PAYMENT_STATUS_CONFIG[order.payment.status] || PAYMENT_STATUS_CONFIG.PENDING
    : PAYMENT_STATUS_CONFIG.PENDING;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dark Navbar Header */}
      <div className="bg-[#1E293B]">
        <div className="container mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white lg:text-2xl">
              LOGO
            </Link>
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link, index) => (
                <Link
                  key={`${link.label}-${index}`}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#1D7CF3] ${
                    link.href === "/belanja" ? "text-[#1D7CF3]" : "text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D7CF3] text-sm font-semibold text-white">
                {getUserInitials()}
              </div>
              <span className="hidden text-sm font-medium text-white md:block">
                {user?.full_name || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 lg:px-8"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link
            href="/belanja"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1D7CF3]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Belanja
          </Link>
        </motion.div>

        {/* Order Header */}
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">No. Pesanan:</span>
                <span className="font-mono text-sm font-medium text-gray-800">
                  {order.order_number}
                </span>
                <button
                  onClick={handleCopyOrderNumber}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Dibuat pada {formatDate(order.created_at)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {order.status === "PENDING_PAYMENT" && order.payment?.snap_redirect_url && (
                <a
                  href={order.payment.snap_redirect_url}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-medium text-white hover:bg-[#EA580C]"
                >
                  <CreditCard className="h-4 w-4" />
                  Bayar Sekarang
                </a>
              )}
              {(order.status === "PENDING_PAYMENT" || order.status === "PROCESSING") && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Batalkan
                </button>
              )}
              {order.status === "DELIVERED" && (
                <button
                  onClick={handleConfirmDelivery}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Konfirmasi Diterima
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <ShoppingBag className="h-5 w-5" />
                Produk ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 p-4"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
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

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-semibold text-[#F97316]">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <MapPin className="h-5 w-5" />
                Alamat Pengiriman
              </h2>

              {order.shipping_address ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">
                    {order.shipping_address.recipient_name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.shipping_address.phone_number}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.shipping_address.address}, {order.shipping_address.city},{" "}
                    {order.shipping_address.province} {order.shipping_address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Alamat tidak tersedia</p>
              )}

              {order.courier && (
                <div className="mt-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Kurir: <span className="font-medium">{order.courier}</span>
                  </span>
                </div>
              )}

              {order.notes && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs font-medium text-gray-500">Catatan:</p>
                  <p className="mt-1 text-sm text-gray-700">{order.notes}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Status */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <CreditCard className="h-5 w-5" />
                Pembayaran
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusConfig.bgColor} ${paymentStatusConfig.color}`}
                  >
                    {paymentStatusConfig.label}
                  </span>
                </div>

                {order.payment?.method && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Metode</span>
                    <span className="text-sm font-medium text-gray-800">
                      {order.payment.method}
                    </span>
                  </div>
                )}

                {order.payment?.expiry_time && order.status === "PENDING_PAYMENT" && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-700">
                      Bayar sebelum{" "}
                      <span className="font-medium">
                        {formatDate(order.payment.expiry_time)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal Produk</span>
                  <span className="text-gray-800">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="text-gray-800">
                    {formatPrice(order.shipping_cost)}
                  </span>
                </div>
                {order.admin_fee && order.admin_fee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Biaya Layanan</span>
                    <span className="text-gray-800">
                      {formatPrice(order.admin_fee)}
                    </span>
                  </div>
                )}
                {order.discount && order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Diskon</span>
                    <span className="text-green-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}

                <hr className="my-3 border-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#F97316]">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Order Timeline */}
            {order.status !== "CANCELLED" && (
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-gray-100 bg-white p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-gray-800">
                  Status Pesanan
                </h2>

                <div className="space-y-4">
                  {[
                    { key: "PENDING_PAYMENT", label: "Menunggu Pembayaran" },
                    { key: "PROCESSING", label: "Diproses" },
                    { key: "SHIPPED", label: "Dikirim" },
                    { key: "DELIVERED", label: "Sampai Tujuan" },
                    { key: "COMPLETED", label: "Selesai" },
                  ].map((step, index, arr) => {
                    const statusOrder = [
                      "PENDING_PAYMENT",
                      "PROCESSING",
                      "SHIPPED",
                      "DELIVERED",
                      "COMPLETED",
                    ];
                    const currentIndex = statusOrder.indexOf(order.status);
                    const stepIndex = statusOrder.indexOf(step.key);
                    const isActive = stepIndex <= currentIndex;
                    const isCurrent = step.key === order.status;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              isActive
                                ? isCurrent
                                  ? "bg-[#1D7CF3] text-white"
                                  : "bg-green-500 text-white"
                                : "border-2 border-gray-200 bg-white"
                            }`}
                          >
                            {isActive && !isCurrent ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isCurrent ? (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-gray-200" />
                            )}
                          </div>
                          {index < arr.length - 1 && (
                            <div
                              className={`h-8 w-0.5 ${
                                isActive && stepIndex < currentIndex
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isActive ? "text-gray-800" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  ChevronDown,
  Check,
  Plus,
  Loader2,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  removeFromCart,
  updateCartItem,
  getShippingAddresses,
  createShippingAddress,
  createOrder,
} from "@/lib/api/marketplace";
import type {
  Cart,
  CartItem,
  ShippingAddress,
  CreateShippingAddressRequest,
} from "@/lib/types/marketplace";
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

// Shipping options
const SHIPPING_OPTIONS = [
  { id: "jne_reg", name: "JNE Regular", price: 15000, estimate: "2-3 hari" },
  { id: "jne_yes", name: "JNE YES", price: 25000, estimate: "1 hari" },
  { id: "sicepat", name: "SiCepat Regular", price: 12000, estimate: "2-3 hari" },
  { id: "anteraja", name: "AnterAja", price: 10000, estimate: "3-4 hari" },
];

// Cart Item Component
function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
  isUpdating,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Product Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-contain p-1"
            unoptimized
          />
        ) : (
          <Image
            src="/images/assets/obat.svg"
            alt={item.product.name}
            fill
            className="object-contain p-1"
          />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <p className="font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            -
          </button>
          <span className="text-sm text-gray-600">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={isUpdating || item.quantity >= item.product.quantity}
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <span className="text-sm font-semibold text-[#F97316]">
          {formatPrice(item.product.final_price)}
        </span>
        <p className="text-xs text-gray-400">
          Subtotal: {formatPrice(item.subtotal)}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Cart state
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = storage.getToken();
    const storedUser = storage.getUser();
    setIsAuthenticated(!!token && !!storedUser);
    setUser(storedUser);
    setIsAuthChecking(false);
  }, []);

  // New address form state
  const [newAddress, setNewAddress] = useState<CreateShippingAddressRequest>({
    recipient_name: "",
    phone_number: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    is_default: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.push("/login?redirect=/belanja/checkout");
    }
  }, [isAuthenticated, isAuthChecking, router]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);
      const response = await getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await getShippingAddresses();
      setAddresses(response.data);
      // Select default address or first address
      const defaultAddr = response.data.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAuthChecking) {
      fetchCart();
      fetchAddresses();
    }
  }, [isAuthenticated, isAuthChecking, fetchCart, fetchAddresses]);

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    try {
      setIsUpdating(true);
      const response = await removeFromCart(itemId);
      setCart(response.data);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle update quantity
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      setIsUpdating(true);
      const response = await updateCartItem(itemId, { quantity });
      setCart(response.data);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle save new address
  const handleSaveNewAddress = async () => {
    if (!newAddress.recipient_name || !newAddress.phone_number || !newAddress.address) {
      alert("Mohon lengkapi data alamat");
      return;
    }

    try {
      setIsSavingAddress(true);
      const response = await createShippingAddress(newAddress);
      setAddresses((prev) => [...prev, response.data]);
      if (newAddress.is_default || addresses.length === 0) {
        setSelectedAddressId(response.data.id);
      }
      setNewAddress({
        recipient_name: "",
        phone_number: "",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        is_default: false,
      });
      setIsAddAddressModalOpen(false);
    } catch (error) {
      console.error("Error creating address:", error);
      alert("Gagal menyimpan alamat");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert("Pilih alamat pengiriman terlebih dahulu");
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert("Keranjang kosong");
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await createOrder({
        shipping_address_id: selectedAddressId,
        shipping_cost: selectedShipping.price,
        courier: selectedShipping.name,
        notes: notes || undefined,
      });

      // Redirect to Midtrans payment
      if (response.payment?.snap_redirect_url) {
        window.location.href = response.payment.snap_redirect_url;
      } else {
        // Fallback to order status page
        router.push(`/belanja/order/${response.order.id}`);
      }
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      const err = error as { message?: string };
      alert(err.message || "Gagal membuat pesanan");
      setIsCheckingOut(false);
    }
  };

  // Get selected address
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Calculate totals
  const subtotal = cart?.total || 0;
  const shippingCost = selectedShipping.price;
  const adminFee = 2500; // Biaya layanan aplikasi
  const total = subtotal + shippingCost + adminFee;

  // Get user initials
  const getUserInitials = () => {
    if (!user?.full_name) return "?";
    return user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (!isAuthenticated || isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
      </div>
    );
  }

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-gray-400" />
        <p className="text-lg font-medium text-gray-600">Keranjang kosong</p>
        <Link
          href="/belanja"
          className="flex items-center gap-2 text-[#1D7CF3] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Lanjut Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dark Navbar Header */}
      <div className="bg-[#1E293B]">
        <div className="container mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/images/assets/logo.svg"
                alt="Glucoin Logo"
                width={120}
                height={40}
                className="h-8 w-auto lg:h-10"
                priority
              />
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

      {/* Checkout Content */}
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
            Kembali
          </Link>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-8 text-2xl font-bold text-gray-800"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Alamat Pengiriman */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Alamat Pengiriman
              </h2>

              {isLoadingAddresses ? (
                <div className="mt-4 flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1D7CF3]" />
                </div>
              ) : selectedAddress ? (
                <div className="mt-4 flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedAddress.recipient_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedAddress.phone_number}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedAddress.address}, {selectedAddress.city},{" "}
                      {selectedAddress.province} {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Belum ada alamat pengiriman
                </p>
              )}

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="mt-4 rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
              >
                {selectedAddress ? "Ubah Alamat" : "Tambah Alamat"}
              </button>
            </motion.div>

            {/* Jenis Pengiriman */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Jenis Pengiriman
              </h2>

              <div className="relative mt-4">
                <button
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:border-gray-300"
                >
                  <div>
                    <span className="font-medium">{selectedShipping.name}</span>
                    <span className="ml-2 text-gray-500">
                      ({selectedShipping.estimate})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1D7CF3]">
                      {formatPrice(selectedShipping.price)}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isShippingOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isShippingOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    {SHIPPING_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedShipping(option);
                          setIsShippingOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                          selectedShipping.id === option.id
                            ? "bg-[#EEF8FF] text-[#1D7CF3]"
                            : "text-gray-600"
                        }`}
                      >
                        <div>
                          <span className="font-medium">{option.name}</span>
                          <span className="ml-2 text-gray-400">
                            ({option.estimate})
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatPrice(option.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Detail Produk */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Detail Produk ({cart.total_items} item)
              </h2>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Catatan */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800">Catatan</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan pesan tambahan di sini"
                rows={3}
                className="mt-4 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
              />
            </motion.div>

            {/* Ringkasan Belanja */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Ringkasan Belanja
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({cart.total_quantity} item)
                  </span>
                  <span className="text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pengiriman</span>
                  <span className="text-gray-800">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Biaya Layanan</span>
                  <span className="text-gray-800">
                    {formatPrice(adminFee)}
                  </span>
                </div>

                <hr className="my-3 border-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-[#F97316]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || !selectedAddressId}
                className="mt-6 w-full rounded-xl bg-[#1D7CF3] py-4 text-base font-semibold text-white transition-colors hover:bg-[#1565D8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Address List Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsAddressModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Daftar Alamat
                </h2>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-6">
                <button
                  onClick={() => setIsAddAddressModalOpen(true)}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1D7CF3] py-3 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Alamat
                </button>

                <div className="space-y-4">
                  {addresses.map((address) => {
                    const isSelected = address.id === selectedAddressId;
                    return (
                      <div
                        key={address.id}
                        className={`rounded-xl border p-4 ${
                          isSelected
                            ? "border-[#1D7CF3] bg-[#EEF8FF]"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {address.recipient_name}
                            </span>
                            {address.is_default && (
                              <span className="rounded bg-[#1D7CF3] px-2 py-0.5 text-xs font-medium text-white">
                                Utama
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.phone_number}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.address}, {address.city}, {address.province}{" "}
                          {address.postal_code}
                        </p>

                        <div className="mt-3 flex justify-end">
                          {isSelected ? (
                            <div className="flex items-center gap-1 text-sm font-medium text-[#1D7CF3]">
                              <Check className="h-4 w-4" />
                              Terpilih
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAddressId(address.id);
                                setIsAddressModalOpen(false);
                              }}
                              className="rounded-lg border border-[#1D7CF3] px-4 py-1.5 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
                            >
                              Pilih
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isAddAddressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsAddAddressModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Tambah Alamat
                </h2>
                <button
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      value={newAddress.recipient_name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, recipient_name: e.target.value })
                      }
                      placeholder="Nama penerima"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Nomor Telepon *
                    </label>
                    <input
                      type="text"
                      value={newAddress.phone_number}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone_number: e.target.value })
                      }
                      placeholder="08xxxxxxxxxx"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address: e.target.value })
                      }
                      placeholder="Jl. xxx No. xx, RT/RW, Kelurahan"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Kota
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="Kota/Kabupaten"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Provinsi
                      </label>
                      <input
                        type="text"
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, province: e.target.value })
                        }
                        placeholder="Provinsi"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={newAddress.postal_code}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, postal_code: e.target.value })
                      }
                      placeholder="Kode pos"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <span className="text-sm font-medium text-gray-700">
                      Jadikan Alamat Utama
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewAddress({ ...newAddress, is_default: !newAddress.is_default })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        newAddress.is_default ? "bg-[#1D7CF3]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          newAddress.is_default ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsAddAddressModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveNewAddress}
                    disabled={isSavingAddress}
                    className="flex-1 rounded-xl bg-[#1D7CF3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8] disabled:opacity-50"
                  >
                    {isSavingAddress ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

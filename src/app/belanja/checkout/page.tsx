"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ChevronDown, Check, Plus } from "lucide-react";
import { useState } from "react";

// Navigation links for marketplace navbar
const navLinks = [
  { href: "/asisten-ai", label: "Asisten AI" },
  { href: "/deteksi-dini", label: "Deteksi Dini" },
  { href: "/booking-dokter", label: "Cari Faskes" },
  { href: "/booking-dokter", label: "Booking Dokter" },
  { href: "/belanja", label: "Belanja" },
];

// Types
interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isPrimary: boolean;
}

// Default addresses
const defaultAddresses: Address[] = [
  {
    id: "1",
    name: "Hanifa Akhilah",
    phone: "+62 812 3456 7890",
    address: "Jl. Prof Soedarto, no 12 Kecamatan Tembalang, Kota Semarang, Jawa Tengah, 50275",
    isPrimary: true,
  },
  {
    id: "2",
    name: "Hanifa",
    phone: "+62 821 9876 5432",
    address: "Jl. Pemuda No. 45, Kecamatan Semarang Tengah, Kota Semarang, Jawa Tengah, 50134",
    isPrimary: false,
  },
];

// Default cart data
const defaultCartItems: CartItem[] = [
  {
    id: "1",
    name: "Glimepiride 300 Tablet",
    image: "/images/assets/obat.svg",
    price: 45000,
    quantity: 1,
  },
  {
    id: "2",
    name: "Glimepiride 300 Tablet",
    image: "/images/assets/obat.svg",
    price: 45000,
    quantity: 1,
  },
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

// Cart Item Component
function CartItemCard({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white transition-colors hover:bg-gray-500"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Product Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-1"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <p className="font-medium text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-500">Total: {item.quantity}</p>
      </div>

      {/* Price */}
      <span className="text-sm font-semibold text-[#F97316]">
        {formatPrice(item.price)}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(defaultCartItems);
  const [shippingMethod, setShippingMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Address modal states
  const [addresses, setAddresses] = useState<Address[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddresses[0].id);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  // New address form states
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressPhone, setNewAddressPhone] = useState("");
  const [newAddressDetail, setNewAddressDetail] = useState("");
  const [newAddressProvince, setNewAddressProvince] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("");
  const [newAddressDistrict, setNewAddressDistrict] = useState("");
  const [newAddressPostalCode, setNewAddressPostalCode] = useState("");
  const [newAddressIsPrimary, setNewAddressIsPrimary] = useState(false);

  const shippingOptions = ["JNE Regular", "JNE Express", "SiCepat", "AnterAja"];

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Get selected address
  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId) || addresses[0];

  // Handle select address
  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    setIsAddressModalOpen(false);
  };

  // Reset new address form
  const resetNewAddressForm = () => {
    setNewAddressName("");
    setNewAddressPhone("");
    setNewAddressDetail("");
    setNewAddressProvince("");
    setNewAddressCity("");
    setNewAddressDistrict("");
    setNewAddressPostalCode("");
    setNewAddressIsPrimary(false);
  };

  // Handle save new address
  const handleSaveNewAddress = () => {
    if (!newAddressName || !newAddressPhone || !newAddressDetail) {
      alert("Mohon lengkapi data alamat");
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      name: newAddressName,
      phone: `+62 ${newAddressPhone}`,
      address: `${newAddressDetail}, ${newAddressDistrict}, ${newAddressCity}, ${newAddressProvince}, ${newAddressPostalCode}`,
      isPrimary: newAddressIsPrimary,
    };

    // If new address is primary, remove primary from others
    if (newAddressIsPrimary) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isPrimary: false })).concat(newAddress)
      );
    } else {
      setAddresses((prev) => [...prev, newAddress]);
    }

    resetNewAddressForm();
    setIsAddAddressModalOpen(false);
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = 0;
  const adminFee = 5000;
  const total = subtotal + shippingCost + adminFee;

  const handleCheckout = () => {
    // Handle checkout logic
    console.log("Processing checkout...");
    alert("Checkout berhasil!");
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
      </div>

      {/* Checkout Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 lg:px-8"
      >
        {/* Page Title */}
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

              <div className="mt-4 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{selectedAddress.name}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedAddress.address}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="mt-4 rounded-lg border border-[#1D7CF3] px-4 py-2 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
              >
                Ubah Alamat
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
                  <span className={shippingMethod ? "text-gray-800" : "text-gray-400"}>
                    {shippingMethod || "Pilih pengiriman"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isShippingOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isShippingOpen && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    {shippingOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setShippingMethod(option);
                          setIsShippingOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                          shippingMethod === option
                            ? "bg-[#EEF8FF] text-[#1D7CF3]"
                            : "text-gray-600"
                        }`}
                      >
                        {option}
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
                Detail Produk
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
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
                rows={4}
                className="mt-4 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
              />
            </motion.div>

            {/* Belanja dengan Kupon */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Belanja dengan Kupon
              </h2>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
                />
                <button className="rounded-lg bg-gray-400 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-500">
                  Pakai
                </button>
              </div>
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
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pengiriman</span>
                  <span className="text-gray-800">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Biaya Admin</span>
                  <span className="text-gray-800">{formatPrice(adminFee)}</span>
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
                className="mt-6 w-full rounded-xl bg-[#1D7CF3] py-4 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
              >
                Checkout
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
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Alamat</h2>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {/* Add Address Button */}
                <button
                  onClick={() => {
                    setIsAddAddressModalOpen(true);
                  }}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1D7CF3] py-3 text-sm font-medium text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Alamat
                </button>

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.map((address) => {
                    const isSelected = address.id === selectedAddressId;
                    return (
                      <div
                        key={address.id}
                        className={`rounded-xl border p-4 ${
                          isSelected ? "border-[#1D7CF3] bg-[#EEF8FF]" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{address.name}</span>
                            {address.isPrimary && (
                              <span className="rounded bg-[#1D7CF3] px-2 py-0.5 text-xs font-medium text-white">
                                Utama
                              </span>
                            )}
                          </div>
                          <button className="text-sm font-medium text-[#1D7CF3] hover:underline">
                            Ubah
                          </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">{address.phone}</p>
                        <p className="mt-1 text-sm text-gray-600">{address.address}</p>

                        <div className="mt-3 flex justify-end">
                          {isSelected ? (
                            <div className="flex items-center gap-1 text-sm font-medium text-[#1D7CF3]">
                              <Check className="h-4 w-4" />
                              Terpilih
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelectAddress(address.id)}
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
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Tambah Alamat</h2>
                <button
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="space-y-4">
                  {/* Nama */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={newAddressName}
                      onChange={(e) => setNewAddressName(e.target.value)}
                      placeholder="Nama penerima"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  {/* Nomor Telepon */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Nomor Telepon
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select className="h-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none">
                          <option value="+62">+62</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={newAddressPhone}
                        onChange={(e) => setNewAddressPhone(e.target.value)}
                        placeholder="Nomor telepon"
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Detail Alamat */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Detail Alamat
                    </label>
                    <textarea
                      value={newAddressDetail}
                      onChange={(e) => setNewAddressDetail(e.target.value)}
                      placeholder="Nama jalan, gedung, no. rumah"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
                    />
                  </div>

                  {/* Provinsi & Kota */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Provinsi
                      </label>
                      <div className="relative">
                        <select
                          value={newAddressProvince}
                          onChange={(e) => setNewAddressProvince(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
                        >
                          <option value="">Pilih Provinsi</option>
                          <option value="Jawa Tengah">Jawa Tengah</option>
                          <option value="Jawa Barat">Jawa Barat</option>
                          <option value="Jawa Timur">Jawa Timur</option>
                          <option value="DKI Jakarta">DKI Jakarta</option>
                          <option value="DIY">DI Yogyakarta</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Kota/Kabupaten
                      </label>
                      <div className="relative">
                        <select
                          value={newAddressCity}
                          onChange={(e) => setNewAddressCity(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
                        >
                          <option value="">Pilih Kota</option>
                          <option value="Kota Semarang">Kota Semarang</option>
                          <option value="Kabupaten Semarang">Kab. Semarang</option>
                          <option value="Kota Bandung">Kota Bandung</option>
                          <option value="Kota Surabaya">Kota Surabaya</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Kecamatan & Kode Pos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Kecamatan
                      </label>
                      <div className="relative">
                        <select
                          value={newAddressDistrict}
                          onChange={(e) => setNewAddressDistrict(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-800 focus:border-[#1D7CF3] focus:outline-none"
                        >
                          <option value="">Pilih Kecamatan</option>
                          <option value="Tembalang">Tembalang</option>
                          <option value="Banyumanik">Banyumanik</option>
                          <option value="Gajahmungkur">Gajahmungkur</option>
                          <option value="Candisari">Candisari</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={newAddressPostalCode}
                        onChange={(e) => setNewAddressPostalCode(e.target.value)}
                        placeholder="Kode pos"
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Jadikan Alamat Utama */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <span className="text-sm font-medium text-gray-700">
                      Jadikan Alamat Utama
                    </span>
                    <button
                      onClick={() => setNewAddressIsPrimary(!newAddressIsPrimary)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        newAddressIsPrimary ? "bg-[#1D7CF3]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          newAddressIsPrimary ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      resetNewAddressForm();
                      setIsAddAddressModalOpen(false);
                    }}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveNewAddress}
                    className="flex-1 rounded-xl bg-[#1D7CF3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1565D8]"
                  >
                    Simpan
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

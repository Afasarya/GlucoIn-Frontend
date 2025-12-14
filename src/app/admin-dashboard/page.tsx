"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Package,
  Building2,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import StatCard from "./components/StatCard";
import DataTable from "./components/DataTable";
import {
  getAllDoctors,
  getAllProducts,
  getAllFacilities,
  getAllBookings,
} from "@/lib/api/admin";
import type { AdminDoctor, AdminProduct, AdminFacility, AdminBooking } from "@/lib/types/admin";

interface DashboardData {
  totalDoctors: number;
  totalProducts: number;
  totalFacilities: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  recentBookings: AdminBooking[];
  doctors: AdminDoctor[];
  products: AdminProduct[];
  facilities: AdminFacility[];
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalDoctors: 0,
    totalProducts: 0,
    totalFacilities: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    doctors: [],
    products: [],
    facilities: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch each API separately to handle errors gracefully
        let doctors: AdminDoctor[] = [];
        let products: AdminProduct[] = [];
        let facilities: AdminFacility[] = [];
        let bookings: AdminBooking[] = [];

        // Fetch doctors
        try {
          const doctorsRes = await getAllDoctors();
          doctors = doctorsRes.data || [];
        } catch (err) {
          console.warn("Failed to fetch doctors:", err);
        }

        // Fetch products (public endpoint)
        try {
          const productsRes = await getAllProducts({ limit: 100 });
          products = productsRes.data || [];
        } catch (err) {
          console.warn("Failed to fetch products:", err);
        }

        // Fetch facilities (public endpoint)
        try {
          const facilitiesRes = await getAllFacilities();
          facilities = facilitiesRes.data || [];
        } catch (err) {
          console.warn("Failed to fetch facilities:", err);
        }

        // Fetch bookings (requires ADMIN role)
        try {
          const bookingsRes = await getAllBookings();
          bookings = bookingsRes.data || [];
        } catch (err) {
          console.warn("Failed to fetch bookings:", err);
        }

        const pendingBookings = bookings.filter(
          (b) => b.status === "PENDING" || b.status === "PENDING_PAYMENT"
        );
        const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
        const totalRevenue = completedBookings.reduce(
          (sum, b) => sum + Number(b.consultation_fee || 0),
          0
        );

        setData({
          totalDoctors: doctors.length,
          totalProducts: products.length,
          totalFacilities: facilities.length,
          totalBookings: bookings.length,
          pendingBookings: pendingBookings.length,
          completedBookings: completedBookings.length,
          totalRevenue,
          recentBookings: bookings.slice(0, 5),
          doctors,
          products,
          facilities,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
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
    visible: { opacity: 1, y: 0 },
  };

  // Booking status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING_PAYMENT: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Bayar" },
      PENDING: { bg: "bg-blue-100", text: "text-blue-700", label: "Menunggu" },
      CONFIRMED: { bg: "bg-green-100", text: "text-green-700", label: "Dikonfirmasi" },
      COMPLETED: { bg: "bg-gray-100", text: "text-gray-700", label: "Selesai" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" },
      EXPIRED: { bg: "bg-gray-100", text: "text-gray-500", label: "Kadaluarsa" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali! Berikut ringkasan sistem Glucoin.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        <StatCard
          title="Total Dokter"
          value={data.totalDoctors}
          subtitle="Dokter terdaftar"
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Total Produk"
          value={data.totalProducts}
          subtitle="Produk di marketplace"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Total Faskes"
          value={data.totalFacilities}
          subtitle="Fasilitas kesehatan"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Total Booking"
          value={data.totalBookings}
          subtitle={`${data.pendingBookings} menunggu konfirmasi`}
          icon={Calendar}
          color="orange"
        />
      </motion.div>

      {/* Revenue & Pending Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pendapatan</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(data.totalRevenue)}</p>
              <p className="text-blue-100 text-sm mt-2">
                Dari {data.completedBookings} booking selesai
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Booking Pending</p>
              <p className="text-3xl font-bold mt-2">{data.pendingBookings}</p>
              <p className="text-orange-100 text-sm mt-2">Menunggu konfirmasi atau pembayaran</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Clock className="h-8 w-8" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Bookings Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          title="Booking Terbaru"
          subtitle="5 booking terakhir di sistem"
          data={data.recentBookings}
          showActions={false}
          columns={[
            {
              key: "user.full_name",
              title: "Pasien",
              render: (item: AdminBooking) => (
                <div>
                  <p className="font-medium text-gray-800">{item.user?.full_name || "-"}</p>
                  <p className="text-xs text-gray-500">{item.user?.email}</p>
                </div>
              ),
            },
            {
              key: "doctor.user.full_name",
              title: "Dokter",
              render: (item: AdminBooking) => (
                <div>
                  <p className="font-medium text-gray-800">
                    Dr. {item.doctor?.user?.full_name || "-"}
                  </p>
                  <p className="text-xs text-gray-500">{item.doctor?.specialization}</p>
                </div>
              ),
            },
            {
              key: "booking_date",
              title: "Tanggal",
              render: (item: AdminBooking) => (
                <div>
                  <p className="text-gray-800">
                    {new Date(item.booking_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.start_time} - {item.end_time}
                  </p>
                </div>
              ),
            },
            {
              key: "consultation_fee",
              title: "Biaya",
              render: (item: AdminBooking) => (
                <span className="font-medium text-gray-800">
                  {formatCurrency(Number(item.consultation_fee))}
                </span>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (item: AdminBooking) => getStatusBadge(item.status),
            },
          ]}
        />
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Top Doctors */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dokter Aktif</h3>
          <div className="space-y-3">
            {data.doctors.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada dokter terdaftar</p>
            ) : (
              data.doctors.slice(0, 4).map((doctor, index) => (
                <div key={doctor.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      Dr. {doctor.user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {doctor.is_available ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {data.products.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada produk</p>
            ) : (
              data.products
                .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
                .slice(0, 4)
                .map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.rating_count || 0} review
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(Number(product.final_price))}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Facilities by Type */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Faskes berdasarkan Tipe</h3>
          <div className="space-y-3">
            {data.facilities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada fasilitas kesehatan</p>
            ) : (
              ["HOSPITAL", "CLINIC", "PUSKESMAS", "PHARMACY", "LAB"].map((type) => {
                const count = data.facilities.filter((f) => f.type === type).length;
                const typeLabels: Record<string, string> = {
                  HOSPITAL: "Rumah Sakit",
                  CLINIC: "Klinik",
                  PUSKESMAS: "Puskesmas",
                  PHARMACY: "Apotek",
                  LAB: "Laboratorium",
                };
                const colors: Record<string, string> = {
                  HOSPITAL: "bg-blue-500",
                  CLINIC: "bg-green-500",
                  PUSKESMAS: "bg-purple-500",
                  PHARMACY: "bg-orange-500",
                  LAB: "bg-red-500",
                };
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${colors[type]}`} />
                    <span className="flex-1 text-sm text-gray-600">
                      {typeLabels[type]}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

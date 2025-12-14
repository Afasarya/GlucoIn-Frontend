"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { getAllBookings } from "@/lib/api/admin";
import type { AdminBooking, BookingStatus, PaymentStatus } from "@/lib/types/admin";

type TransactionType = "BOOKING" | "ORDER" | "ALL";

interface Transaction {
  id: string;
  type: TransactionType;
  order_id?: string;
  amount: number;
  status: PaymentStatus;
  payment_type?: string;
  user_name: string;
  user_email: string;
  description: string;
  booking_status?: BookingStatus;
  created_at: string;
  booking?: AdminBooking;
}

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu", icon: Clock },
  PAID: { bg: "bg-green-100", text: "text-green-700", label: "Lunas", icon: CheckCircle },
  FAILED: { bg: "bg-red-100", text: "text-red-700", label: "Gagal", icon: XCircle },
  EXPIRED: { bg: "bg-gray-100", text: "text-gray-500", label: "Kadaluarsa", icon: AlertCircle },
  REFUNDED: { bg: "bg-purple-100", text: "text-purple-700", label: "Dikembalikan", icon: AlertCircle },
};

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string }> = {
  PENDING_PAYMENT: { label: "Menunggu Bayar" },
  PENDING: { label: "Menunggu Konfirmasi" },
  CONFIRMED: { label: "Dikonfirmasi" },
  COMPLETED: { label: "Selesai" },
  CANCELLED: { label: "Dibatalkan" },
  EXPIRED: { label: "Kadaluarsa" },
};

export default function TransactionsManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch bookings
      const bookingsRes = await getAllBookings();
      const bookings = bookingsRes.data || [];

      // Transform bookings to transactions
      const bookingTransactions: Transaction[] = bookings.map((booking) => ({
        id: booking.id,
        type: "BOOKING" as TransactionType,
        order_id: booking.payment?.order_id,
        amount: Number(booking.consultation_fee),
        status: booking.payment_status,
        payment_type: booking.payment?.payment_type,
        user_name: booking.user?.full_name || "-",
        user_email: booking.user?.email || "-",
        description: `Konsultasi dengan Dr. ${booking.doctor?.user?.full_name || "Unknown"}`,
        booking_status: booking.status,
        created_at: booking.created_at,
        booking: booking,
      }));

      // For now, we only have booking transactions
      // In production, you'd also fetch marketplace orders
      setTransactions(bookingTransactions);
      setFilteredTransactions(bookingTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.user_name.toLowerCase().includes(query) ||
          tx.user_email.toLowerCase().includes(query) ||
          tx.order_id?.toLowerCase().includes(query) ||
          tx.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    if (typeFilter !== "ALL") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at).toDateString() === filterDate
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, statusFilter, typeFilter, dateFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleViewTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: TransactionType) => {
    if (type === "BOOKING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Stethoscope className="h-3.5 w-3.5" />
          Konsultasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <ShoppingBag className="h-3.5 w-3.5" />
        Marketplace
      </span>
    );
  };

  // Stats
  const totalTransactions = transactions.length;
  const totalRevenue = transactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const pendingTransactions = transactions.filter((tx) => tx.status === "PENDING").length;
  const paidTransactions = transactions.filter((tx) => tx.status === "PAID").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Transaksi</h1>
          <p className="text-gray-500 mt-1">Kelola semua transaksi pembayaran</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
              <p className="text-xs text-gray-500">Total Transaksi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500">Total Pendapatan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingTransactions}</p>
              <p className="text-xs text-gray-500">Menunggu Bayar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{paidTransactions}</p>
              <p className="text-xs text-gray-500">Lunas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Lunas</option>
            <option value="FAILED">Gagal</option>
            <option value="EXPIRED">Kadaluarsa</option>
            <option value="REFUNDED">Dikembalikan</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | "ALL")}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="BOOKING">Konsultasi</option>
            <option value="ORDER">Marketplace</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredTransactions}
        isLoading={isLoading}
        onView={handleViewTransaction}
        showActions={true}
        emptyMessage="Tidak ada transaksi ditemukan"
        columns={[
          {
            key: "order_id",
            title: "ID Transaksi",
            render: (tx: Transaction) => (
              <div>
                <p className="font-mono text-sm font-medium text-gray-800">
                  {tx.order_id || tx.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ),
          },
          {
            key: "type",
            title: "Tipe",
            render: (tx: Transaction) => getTypeBadge(tx.type),
          },
          {
            key: "user_name",
            title: "Pelanggan",
            render: (tx: Transaction) => (
              <div>
                <p className="font-medium text-gray-800">{tx.user_name}</p>
                <p className="text-xs text-gray-500">{tx.user_email}</p>
              </div>
            ),
          },
          {
            key: "description",
            title: "Deskripsi",
            render: (tx: Transaction) => (
              <p className="text-sm text-gray-600 max-w-xs truncate">{tx.description}</p>
            ),
          },
          {
            key: "amount",
            title: "Jumlah",
            render: (tx: Transaction) => (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-800">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ),
          },
          {
            key: "payment_type",
            title: "Metode",
            render: (tx: Transaction) => (
              <span className="text-sm text-gray-600 capitalize">
                {tx.payment_type?.replace(/_/g, " ") || "-"}
              </span>
            ),
          },
          {
            key: "status",
            title: "Status",
            render: (tx: Transaction) => getStatusBadge(tx.status),
          },
        ]}
      />

      {/* View Transaction Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Transaksi"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Transaction ID & Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">ID Transaksi</p>
                <p className="font-mono text-lg font-bold text-gray-800">
                  {selectedTransaction.order_id || selectedTransaction.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                {getTypeBadge(selectedTransaction.type)}
                {getStatusBadge(selectedTransaction.status)}
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <p className="text-blue-100 text-sm">Total Pembayaran</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(selectedTransaction.amount)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pelanggan</p>
                <p className="font-medium text-gray-800">{selectedTransaction.user_name}</p>
                <p className="text-sm text-gray-500">{selectedTransaction.user_email}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Metode Pembayaran</p>
                <p className="font-medium text-gray-800 capitalize">
                  {selectedTransaction.payment_type?.replace(/_/g, " ") || "Belum dipilih"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tanggal</p>
                <p className="font-medium text-gray-800">
                  {new Date(selectedTransaction.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedTransaction.created_at).toLocaleTimeString("id-ID")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deskripsi</p>
                <p className="font-medium text-gray-800">{selectedTransaction.description}</p>
              </div>
            </div>

            {/* Booking Details (if applicable) */}
            {selectedTransaction.booking && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Detail Booking</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Status Booking</p>
                    <p className="font-medium text-gray-800">
                      {BOOKING_STATUS_CONFIG[selectedTransaction.booking.status]?.label || selectedTransaction.booking.status}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Jadwal</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedTransaction.booking.booking_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedTransaction.booking.start_time} - {selectedTransaction.booking.end_time}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              {selectedTransaction.status === "PENDING" && (
                <button className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                  Batalkan
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

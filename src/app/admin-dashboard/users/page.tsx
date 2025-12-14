"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import DataTable from "../components/DataTable";
import Modal, { ConfirmModal } from "../components/Modal";
import { getAllDoctors, getAllBookings } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types/admin";

// We'll fetch users from the doctors endpoint since there's no dedicated admin/users endpoint
// This is a workaround - in production, you'd have a proper admin/users endpoint

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Create users list from available data
      const userMap = new Map<string, AdminUser>();

      // Fetch doctors to get user data (workaround)
      try {
        const doctorsRes = await getAllDoctors();
        const doctors = doctorsRes.data || [];

        // Add doctor users
        doctors.forEach((doctor) => {
          if (doctor.user && doctor.user.id) {
            userMap.set(doctor.user.id, {
              id: doctor.user.id,
              email: doctor.user.email || "",
              full_name: doctor.user.full_name || "Unknown",
              role: "DOCTOR",
              phone_number: doctor.user.phone_number,
              is_verified: true,
              created_at: doctor.created_at,
              updated_at: doctor.updated_at,
            });
          }
        });
      } catch (err) {
        console.warn("Failed to fetch doctors for users:", err);
      }

      // Fetch bookings to get patient data
      try {
        const bookingsRes = await getAllBookings();
        const bookings = bookingsRes.data || [];

        // Add booking users (patients)
        bookings.forEach((booking) => {
          if (booking.user && booking.user.id && !userMap.has(booking.user.id)) {
            userMap.set(booking.user.id, {
              id: booking.user.id,
              email: booking.user.email || "",
              full_name: booking.user.full_name || "Unknown",
              role: "USER",
              is_verified: true,
              created_at: booking.created_at,
              updated_at: booking.updated_at,
            });
          }
        });
      } catch (err) {
        console.warn("Failed to fetch bookings for users:", err);
      }

      const usersList = Array.from(userMap.values());
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      ADMIN: { bg: "bg-purple-100", text: "text-purple-700", label: "Admin" },
      DOCTOR: { bg: "bg-blue-100", text: "text-blue-700", label: "Dokter" },
      USER: { bg: "bg-green-100", text: "text-green-700", label: "User" },
    };
    const c = config[role] || config.USER;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Shield className="h-3 w-3" />
        {c.label}
      </span>
    );
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    // In production, call deleteUser API
    console.log("Delete user:", selectedUser.id);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    // Refresh list
    await fetchUsers();
  };

  // Stats
  const totalUsers = users.length;
  const totalDoctors = users.filter((u) => u.role === "DOCTOR").length;
  const totalPatients = users.filter((u) => u.role === "USER").length;
  const verifiedUsers = users.filter((u) => u.is_verified).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-gray-500 mt-1">Kelola semua pengguna dalam sistem</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm">
          <Plus className="h-5 w-5" />
          Tambah User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total User</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalDoctors}</p>
              <p className="text-xs text-gray-500">Dokter</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
              <p className="text-xs text-gray-500">Pasien</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{verifiedUsers}</p>
              <p className="text-xs text-gray-500">Terverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Role</option>
            <option value="USER">User</option>
            <option value="DOCTOR">Dokter</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="h-11 px-4 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        isLoading={isLoading}
        onView={handleViewUser}
        onDelete={handleDeleteUser}
        emptyMessage="Tidak ada user ditemukan"
        columns={[
          {
            key: "full_name",
            title: "Nama",
            render: (user: AdminUser) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {(user.full_name || "?")
                    .split(" ")
                    .map((n) => n[0] || "")
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.full_name || "-"}</p>
                  <p className="text-xs text-gray-500">{user.email || "-"}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            title: "Role",
            render: (user: AdminUser) => getRoleBadge(user.role),
          },
          {
            key: "phone_number",
            title: "Telepon",
            render: (user: AdminUser) => (
              <span className="text-gray-600">{user.phone_number || "-"}</span>
            ),
          },
          {
            key: "is_verified",
            title: "Status",
            render: (user: AdminUser) => (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.is_verified
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_verified ? (
                  <>
                    <UserCheck className="h-3 w-3" />
                    Terverifikasi
                  </>
                ) : (
                  <>
                    <UserX className="h-3 w-3" />
                    Belum Verifikasi
                  </>
                )}
              </span>
            ),
          },
          {
            key: "created_at",
            title: "Terdaftar",
            render: (user: AdminUser) => (
              <span className="text-gray-600">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ),
          },
        ]}
      />

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail User"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {(selectedUser.full_name || "?")
                  .split(" ")
                  .map((n) => n[0] || "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedUser.full_name || "-"}
                </h3>
                {getRoleBadge(selectedUser.role)}
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800">{selectedUser.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Telepon</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedUser.phone_number || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <UserCheck className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Status Verifikasi</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedUser.is_verified ? "Terverifikasi" : "Belum Verifikasi"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                Edit User
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${selectedUser?.full_name || "ini"}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
      />
    </motion.div>
  );
}

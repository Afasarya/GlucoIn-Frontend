"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Search,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DataTable from "../components/DataTable";
import Modal, { ConfirmModal } from "../components/Modal";
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorAvailability,
} from "@/lib/api/admin";
import type { AdminDoctor, CreateDoctorRequest, DoctorSchedule } from "@/lib/types/admin";

const SPECIALIZATIONS = [
  "Endocrinology",
  "General Practitioner",
  "Internal Medicine",
  "Diabetologist",
  "Nutritionist",
  "Cardiologist",
];

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" },
  { value: "SUNDAY", label: "Minggu" },
];

export default function DoctorsManagementPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<AdminDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("ALL");
  
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateDoctorRequest>({
    user_id: "",
    specialization: "",
    alamat_praktek: "",
    price_range: "",
    is_available: true,
    schedules: [],
  });

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllDoctors();
      const data = response.data || [];
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Filter doctors
  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.user?.full_name?.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.alamat_praktek.toLowerCase().includes(query)
      );
    }

    if (specializationFilter !== "ALL") {
      filtered = filtered.filter(
        (doctor) => doctor.specialization === specializationFilter
      );
    }

    if (availabilityFilter !== "ALL") {
      filtered = filtered.filter(
        (doctor) => doctor.is_available === (availabilityFilter === "AVAILABLE")
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, specializationFilter, availabilityFilter]);

  const handleViewDoctor = (doctor: AdminDoctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  const handleEditDoctor = (doctor: AdminDoctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      user_id: doctor.user_id,
      specialization: doctor.specialization,
      alamat_praktek: doctor.alamat_praktek,
      price_range: doctor.price_range,
      is_available: doctor.is_available,
      schedules: [],
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteDoctor = (doctor: AdminDoctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setFormData({
      user_id: "",
      specialization: "",
      alamat_praktek: "",
      price_range: "",
      is_available: true,
      schedules: [],
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      if (selectedDoctor) {
        // Update
        await updateDoctor(selectedDoctor.id, formData);
      } else {
        // Create
        await createDoctor(formData);
      }
      setIsFormModalOpen(false);
      await fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDoctor) return;
    try {
      setIsSubmitting(true);
      await deleteDoctor(selectedDoctor.id);
      setIsDeleteModalOpen(false);
      await fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (doctor: AdminDoctor) => {
    try {
      await updateDoctorAvailability(doctor.id, !doctor.is_available);
      await fetchDoctors();
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  // Get unique specializations from doctors
  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  // Stats
  const totalDoctors = doctors.length;
  const availableDoctors = doctors.filter((d) => d.is_available).length;
  const unavailableDoctors = doctors.filter((d) => !d.is_available).length;

  const formatSchedule = (schedules?: DoctorSchedule[]) => {
    if (!schedules || schedules.length === 0) return "Tidak ada jadwal";
    const activeSchedules = schedules.filter((s) => s.is_active);
    if (activeSchedules.length === 0) return "Tidak ada jadwal aktif";
    
    const days = activeSchedules.map((s) => {
      const day = DAYS_OF_WEEK.find((d) => d.value === s.day_of_week);
      return day?.label || s.day_of_week;
    });
    return [...new Set(days)].join(", ");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Dokter</h1>
          <p className="text-gray-500 mt-1">Kelola data dokter dan jadwal praktik</p>
        </div>
        <button
          onClick={handleAddDoctor}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Tambah Dokter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalDoctors}</p>
              <p className="text-xs text-gray-500">Total Dokter</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{availableDoctors}</p>
              <p className="text-xs text-gray-500">Tersedia</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{unavailableDoctors}</p>
              <p className="text-xs text-gray-500">Tidak Tersedia</p>
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
            placeholder="Cari dokter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Spesialisasi</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Status</option>
            <option value="AVAILABLE">Tersedia</option>
            <option value="UNAVAILABLE">Tidak Tersedia</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredDoctors}
        isLoading={isLoading}
        onView={handleViewDoctor}
        onEdit={handleEditDoctor}
        onDelete={handleDeleteDoctor}
        emptyMessage="Tidak ada dokter ditemukan"
        columns={[
          {
            key: "user.full_name",
            title: "Dokter",
            render: (doctor: AdminDoctor) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {doctor.user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "DR"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Dr. {doctor.user?.full_name || "-"}
                  </p>
                  <p className="text-xs text-gray-500">{doctor.user?.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "specialization",
            title: "Spesialisasi",
            render: (doctor: AdminDoctor) => (
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {doctor.specialization}
              </span>
            ),
          },
          {
            key: "alamat_praktek",
            title: "Alamat Praktik",
            render: (doctor: AdminDoctor) => (
              <div className="flex items-start gap-2 max-w-xs">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 line-clamp-2">
                  {doctor.alamat_praktek}
                </span>
              </div>
            ),
          },
          {
            key: "price_range",
            title: "Tarif",
            render: (doctor: AdminDoctor) => (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  Rp {doctor.price_range}
                </span>
              </div>
            ),
          },
          {
            key: "is_available",
            title: "Status",
            render: (doctor: AdminDoctor) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAvailability(doctor);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  doctor.is_available
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {doctor.is_available ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Tersedia
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Tidak Tersedia
                  </>
                )}
              </button>
            ),
          },
        ]}
      />

      {/* View Doctor Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Dokter"
        size="lg"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                {selectedDoctor.user?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "DR"}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Dr. {selectedDoctor.user?.full_name}
                </h3>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mt-1">
                  {selectedDoctor.specialization}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Alamat Praktik</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {selectedDoctor.alamat_praktek}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Tarif Konsultasi</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  Rp {selectedDoctor.price_range}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Jadwal Praktik</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {formatSchedule(selectedDoctor.schedules)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Status</span>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedDoctor.is_available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedDoctor.is_available ? "Tersedia" : "Tidak Tersedia"}
                </span>
              </div>
            </div>

            {/* Schedule List */}
            {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Jadwal Praktik</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDoctor.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        schedule.is_active
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {DAYS_OF_WEEK.find((d) => d.value === schedule.day_of_week)?.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.time_slot} ({schedule.duration_minutes} menit)
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          schedule.is_active ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {schedule.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  ))}
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
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Edit Dokter
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedDoctor ? "Edit Dokter" : "Tambah Dokter"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              placeholder="UUID user yang akan dijadikan dokter"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={!!selectedDoctor}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spesialisasi <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Pilih spesialisasi</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Praktik <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.alamat_praktek}
              onChange={(e) => setFormData({ ...formData, alamat_praktek: e.target.value })}
              placeholder="Alamat lengkap tempat praktik"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarif Konsultasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.price_range}
              onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              placeholder="Contoh: 150000-300000"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">
              Dokter tersedia untuk konsultasi
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </span>
              ) : selectedDoctor ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Dokter"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Dokter"
        message={`Apakah Anda yakin ingin menghapus Dr. ${selectedDoctor?.user?.full_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
        isLoading={isSubmitting}
      />
    </motion.div>
  );
}

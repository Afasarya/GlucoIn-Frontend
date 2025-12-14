"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DataTable from "../components/DataTable";
import Modal, { ConfirmModal } from "../components/Modal";
import {
  getAllFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from "@/lib/api/admin";
import type { AdminFacility, CreateFacilityRequest, FacilityType } from "@/lib/types/admin";

const FACILITY_TYPES: { value: FacilityType; label: string; color: string }[] = [
  { value: "HOSPITAL", label: "Rumah Sakit", color: "bg-blue-100 text-blue-700" },
  { value: "CLINIC", label: "Klinik", color: "bg-green-100 text-green-700" },
  { value: "PUSKESMAS", label: "Puskesmas", color: "bg-purple-100 text-purple-700" },
  { value: "PHARMACY", label: "Apotek", color: "bg-orange-100 text-orange-700" },
  { value: "LAB", label: "Laboratorium", color: "bg-red-100 text-red-700" },
  { value: "OTHER", label: "Lainnya", color: "bg-gray-100 text-gray-700" },
];

const getTypeInfo = (type?: string | null) => {
  if (!type) return { label: "Unknown", color: "bg-gray-100 text-gray-700" };
  const info = FACILITY_TYPES.find((t) => t.value === type);
  return info || { label: type, color: "bg-gray-100 text-gray-700" };
};

export default function FacilitiesManagementPage() {
  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<AdminFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [selectedFacility, setSelectedFacility] = useState<AdminFacility | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateFacilityRequest>({
    name: "",
    type: "CLINIC",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    is_active: true,
  });

  const fetchFacilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllFacilities();
      const data = response.data || [];
      setFacilities(data);
      setFilteredFacilities(data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Filter facilities
  useEffect(() => {
    let filtered = facilities;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (facility) =>
          facility.name.toLowerCase().includes(query) ||
          facility.address?.toLowerCase().includes(query) ||
          facility.city?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "ALL") {
      filtered = filtered.filter((facility) => facility.type === typeFilter);
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchQuery, typeFilter]);

  const handleViewFacility = (facility: AdminFacility) => {
    setSelectedFacility(facility);
    setIsViewModalOpen(true);
  };

  const handleEditFacility = (facility: AdminFacility) => {
    setSelectedFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      address: facility.address || "",
      city: facility.city || "",
      province: facility.province || "",
      postal_code: facility.postal_code || "",
      phone: facility.phone || "",
      latitude: facility.latitude,
      longitude: facility.longitude,
      is_active: facility.is_active,
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteFacility = (facility: AdminFacility) => {
    setSelectedFacility(facility);
    setIsDeleteModalOpen(true);
  };

  const handleAddFacility = () => {
    setSelectedFacility(null);
    setFormData({
      name: "",
      type: "CLINIC",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      phone: "",
      latitude: 0,
      longitude: 0,
      is_active: true,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      if (selectedFacility) {
        await updateFacility(selectedFacility.id, formData);
      } else {
        await createFacility(formData);
      }
      setIsFormModalOpen(false);
      await fetchFacilities();
    } catch (error) {
      console.error("Error saving facility:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedFacility) return;
    try {
      setIsSubmitting(true);
      await deleteFacility(selectedFacility.id);
      setIsDeleteModalOpen(false);
      await fetchFacilities();
    } catch (error) {
      console.error("Error deleting facility:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats by type
  const getStats = () => {
    const stats: Record<string, number> = {};
    FACILITY_TYPES.forEach((t) => {
      stats[t.value] = facilities.filter((f) => f.type === t.value).length;
    });
    return stats;
  };
  const stats = getStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Faskes</h1>
          <p className="text-gray-500 mt-1">Kelola fasilitas kesehatan dalam sistem</p>
        </div>
        <button
          onClick={handleAddFacility}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Tambah Faskes
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {FACILITY_TYPES.map((type) => (
          <div key={type.value} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${type.color.split(" ")[0]} flex items-center justify-center`}>
                <Building2 className={`h-5 w-5 ${type.color.split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats[type.value] || 0}</p>
                <p className="text-xs text-gray-500 truncate">{type.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari faskes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Tipe</option>
            {FACILITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredFacilities}
        isLoading={isLoading}
        onView={handleViewFacility}
        onEdit={handleEditFacility}
        onDelete={handleDeleteFacility}
        emptyMessage="Tidak ada faskes ditemukan"
        columns={[
          {
            key: "name",
            title: "Nama Faskes",
            render: (facility: AdminFacility) => {
              const typeInfo = getTypeInfo(facility.type);
              const colorParts = (typeInfo.color || "bg-gray-100 text-gray-700").split(" ");
              return (
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${colorParts[0] || "bg-gray-100"} flex items-center justify-center`}>
                    <Building2 className={`h-5 w-5 ${colorParts[1] || "text-gray-700"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{facility.name || "-"}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                </div>
              );
            },
          },
          {
            key: "address",
            title: "Alamat",
            render: (facility: AdminFacility) => (
              <div className="flex items-start gap-2 max-w-xs">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 line-clamp-1">{facility.address || "-"}</p>
                  <p className="text-xs text-gray-400">
                    {[facility.city, facility.province].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "phone",
            title: "Telepon",
            render: (facility: AdminFacility) => (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{facility.phone || "-"}</span>
              </div>
            ),
          },
          {
            key: "coordinates",
            title: "Koordinat",
            render: (facility: AdminFacility) => (
              <div className="text-xs text-gray-500">
                <p>Lat: {facility.latitude != null ? Number(facility.latitude).toFixed(4) : "-"}</p>
                <p>Lng: {facility.longitude != null ? Number(facility.longitude).toFixed(4) : "-"}</p>
              </div>
            ),
          },
          {
            key: "is_active",
            title: "Status",
            render: (facility: AdminFacility) => (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  facility.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {facility.is_active ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Aktif
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Nonaktif
                  </>
                )}
              </span>
            ),
          },
        ]}
      />

      {/* View Facility Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Faskes"
        size="lg"
      >
        {selectedFacility && (() => {
          const typeInfo = getTypeInfo(selectedFacility.type);
          const colorParts = (typeInfo.color || "bg-gray-100 text-gray-700").split(" ");
          return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-xl ${colorParts[0] || "bg-gray-100"} flex items-center justify-center`}>
                <Building2 className={`h-8 w-8 ${colorParts[1] || "text-gray-700"}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedFacility.name || "-"}</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Alamat</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {selectedFacility.address || "-"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {[selectedFacility.city, selectedFacility.province, selectedFacility.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Telepon</span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {selectedFacility.phone || "-"}
                </p>
              </div>
            </div>

            {/* Map Preview Placeholder */}
            <div className="rounded-lg bg-gray-100 h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Lat: {selectedFacility.latitude != null ? Number(selectedFacility.latitude).toFixed(6) : "-"}, Lng: {selectedFacility.longitude != null ? Number(selectedFacility.longitude).toFixed(6) : "-"}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                >
                  Buka di Google Maps
                </a>
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
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditFacility(selectedFacility);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Edit Faskes
              </button>
            </div>
          </div>
          );
        })()}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedFacility ? "Edit Faskes" : "Tambah Faskes"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Faskes <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama fasilitas kesehatan"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FacilityType })}
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {FACILITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Kota"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="Provinsi"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="Kode pos"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Nomor telepon"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                placeholder="-6.2088"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                placeholder="106.8456"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Faskes aktif (ditampilkan di pencarian)
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
              ) : selectedFacility ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Faskes"
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
        title="Hapus Faskes"
        message={`Apakah Anda yakin ingin menghapus "${selectedFacility?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
        isLoading={isSubmitting}
      />
    </motion.div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  ShoppingCart,
  Star,
  Box,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import DataTable from "../components/DataTable";
import Modal, { ConfirmModal } from "../components/Modal";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/admin";
import type { AdminProduct, CreateProductRequest, ProductCategory } from "@/lib/types/admin";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "GLUCOSE_METER", label: "Alat Ukur Gula Darah" },
  { value: "TEST_STRIPS", label: "Strip Test" },
  { value: "INSULIN_SUPPLIES", label: "Perlengkapan Insulin" },
  { value: "SUPPLEMENTS", label: "Suplemen" },
  { value: "FOOD", label: "Makanan" },
  { value: "OTHER", label: "Lainnya" },
];

const getCategoryLabel = (category: string) => {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat?.label || category;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    GLUCOSE_METER: "bg-blue-100 text-blue-700",
    TEST_STRIPS: "bg-purple-100 text-purple-700",
    INSULIN_SUPPLIES: "bg-green-100 text-green-700",
    SUPPLEMENTS: "bg-orange-100 text-orange-700",
    FOOD: "bg-yellow-100 text-yellow-700",
    OTHER: "bg-gray-100 text-gray-700",
  };
  return colors[category] || colors.OTHER;
};

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<string>("ALL");

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    description: "",
    price: 0,
    discount_percent: 0,
    quantity: 0,
    category: "OTHER",
    image_url: "",
    is_active: true,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllProducts({ limit: 1000 });
      const data = response.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    if (stockFilter === "IN_STOCK") {
      filtered = filtered.filter((product) => product.quantity > 0);
    } else if (stockFilter === "OUT_OF_STOCK") {
      filtered = filtered.filter((product) => product.quantity === 0);
    } else if (stockFilter === "LOW_STOCK") {
      filtered = filtered.filter((product) => product.quantity > 0 && product.quantity <= 10);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleViewProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      discount_percent: product.discount_percent,
      quantity: product.quantity,
      category: product.category,
      image_url: product.image_url || "",
      is_active: product.is_active,
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      discount_percent: 0,
      quantity: 0,
      category: "OTHER",
      image_url: "",
      is_active: true,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setIsFormModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      await deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalRatings = products.reduce((sum, p) => sum + (p.rating_count || 0), 0);
  const outOfStock = products.filter((p) => (p.quantity || 0) === 0).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500 mt-1">Kelola produk marketplace</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Tambah Produk
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
              <p className="text-xs text-gray-500">Total Produk</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Box className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
              <p className="text-xs text-gray-500">Total Stok</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalRatings}</p>
              <p className="text-xs text-gray-500">Total Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{outOfStock}</p>
              <p className="text-xs text-gray-500">Stok Habis</p>
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
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Semua Stok</option>
            <option value="IN_STOCK">Tersedia</option>
            <option value="LOW_STOCK">Stok Rendah</option>
            <option value="OUT_OF_STOCK">Habis</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredProducts}
        isLoading={isLoading}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        emptyMessage="Tidak ada produk ditemukan"
        columns={[
          {
            key: "name",
            title: "Produk",
            render: (product: AdminProduct) => (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {product.description}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "category",
            title: "Kategori",
            render: (product: AdminProduct) => (
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                  product.category
                )}`}
              >
                {getCategoryLabel(product.category)}
              </span>
            ),
          },
          {
            key: "price",
            title: "Harga",
            render: (product: AdminProduct) => (
              <div>
                {product.discount_percent > 0 ? (
                  <>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(Number(product.final_price))}
                    </p>
                    <p className="text-xs text-gray-400 line-through">
                      {formatCurrency(Number(product.price))}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-gray-800">
                    {formatCurrency(Number(product.price))}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "quantity",
            title: "Stok",
            render: (product: AdminProduct) => (
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  (product.quantity || 0) === 0
                    ? "bg-red-100 text-red-700"
                    : (product.quantity || 0) <= 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.quantity || 0} unit
              </span>
            ),
          },
          {
            key: "rating_count",
            title: "Review",
            render: (product: AdminProduct) => (
              <span className="text-gray-600">{product.rating_count || 0}</span>
            ),
          },
          {
            key: "rating",
            title: "Rating",
            render: (product: AdminProduct) => (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-800">
                  {Number(product.rating).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">({product.rating_count || 0})</span>
              </div>
            ),
          },
        ]}
      />

      {/* View Product Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detail Produk"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Image & Info */}
            <div className="flex gap-6">
              <div className="h-32 w-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedProduct.name}
                </h3>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(
                    selectedProduct.category
                  )}`}
                >
                  {getCategoryLabel(selectedProduct.category)}
                </span>
                <p className="text-gray-600 mt-3">{selectedProduct.description}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(Number(selectedProduct.final_price))}
                </p>
                <p className="text-xs text-gray-500 mt-1">Harga</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {selectedProduct.discount_percent}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Diskon</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-gray-800">{selectedProduct.quantity || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Stok</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-2xl font-bold text-gray-800">{selectedProduct.rating_count || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Review</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {Number(selectedProduct.rating).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">
                  dari {selectedProduct.rating_count || 0} ulasan
                </p>
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
                  handleEditProduct(selectedProduct);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Edit Produk
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedProduct ? "Edit Produk" : "Tambah Produk"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama produk"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi produk"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ProductCategory })
                }
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
                min={0}
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diskon (%)
              </label>
              <input
                type="number"
                value={formData.discount_percent}
                onChange={(e) =>
                  setFormData({ ...formData, discount_percent: Number(e.target.value) })
                }
                placeholder="0"
                min={0}
                max={100}
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                placeholder="0"
                min={0}
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
              Produk aktif (ditampilkan di marketplace)
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
              ) : selectedProduct ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Produk"
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
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
        isLoading={isSubmitting}
      />
    </motion.div>
  );
}

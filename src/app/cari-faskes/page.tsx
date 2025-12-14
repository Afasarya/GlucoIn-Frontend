"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Search, Clock, MapPin, Phone, X, Loader2, Navigation, RefreshCw } from "lucide-react";
import Navbar from "@/app/components/common/Navbar";
import type { ComponentType } from "react";
import {
  getNearbyFacilities,
  calculateDuration,
  getFacilityTypeLabel,
  formatOperatingHours,
} from "@/lib/api/facility";
import type { HealthcareFacility } from "@/lib/types/facility";

// Internal Faskes type for UI compatibility
interface Faskes {
  id: string;
  name: string;
  type: "HOSPITAL" | "PHARMACY" | "CLINIC" | "PUSKESMAS" | "LAB";
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  phone: string;
  distance: number;
  duration: number;
  image: string;
  city?: string;
  province?: string;
}

// Map component props type
interface MapComponentProps {
  faskesList: Faskes[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (faskes: Faskes) => void;
  selectedFaskes: Faskes | null;
}

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic<MapComponentProps>(
  () => import("./MapComponent") as Promise<{ default: ComponentType<MapComponentProps> }>,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#1D7CF3]" />
        <span className="ml-2 text-gray-500">Memuat peta...</span>
      </div>
    ),
  }
);

// Filter options - updated to match backend types
const filterOptions = [
  { value: "semua", label: "Semua" },
  { value: "HOSPITAL", label: "Rumah Sakit" },
  { value: "CLINIC", label: "Klinik" },
  { value: "PUSKESMAS", label: "Puskesmas" },
  { value: "PHARMACY", label: "Apotek" },
  { value: "LAB", label: "Laboratorium" },
];

// Convert backend facility to UI Faskes type
function convertToFaskes(facility: HealthcareFacility): Faskes {
  return {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    address: facility.address,
    latitude: facility.latitude,
    longitude: facility.longitude,
    operatingHours: formatOperatingHours(
      facility.is_open_24h,
      facility.opening_time,
      facility.closing_time
    ),
    phone: facility.phone || "-",
    distance: facility.distance_km ? Number(facility.distance_km.toFixed(2)) : 0,
    duration: facility.distance_km ? calculateDuration(facility.distance_km) : 0,
    image: facility.image_url || "/images/assets/faskes-1.jpg",
    city: facility.city,
    province: facility.province,
  };
}

// Get type color
function getTypeColor(type: Faskes["type"]): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    HOSPITAL: { bg: "bg-red-100", text: "text-red-700" },
    PHARMACY: { bg: "bg-green-100", text: "text-green-700" },
    CLINIC: { bg: "bg-blue-100", text: "text-blue-700" },
    PUSKESMAS: { bg: "bg-orange-100", text: "text-orange-700" },
    LAB: { bg: "bg-purple-100", text: "text-purple-700" },
  };
  return colors[type] || { bg: "bg-gray-100", text: "text-gray-700" };
}

// Faskes Card Component
function FaskesCard({
  faskes,
  onViewDetail,
  onRoute,
}: {
  faskes: Faskes;
  onViewDetail: (faskes: Faskes) => void;
  onRoute: (faskes: Faskes) => void;
}) {
  const typeColor = getTypeColor(faskes.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Type Label */}
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColor.bg} ${typeColor.text}`}>
        {getFacilityTypeLabel(faskes.type)}
      </span>

      {/* Name */}
      <h3 className="mt-1.5 text-sm font-bold text-gray-800 line-clamp-2">{faskes.name}</h3>

      {/* Operating Hours */}
      <p className="mt-0.5 text-xs text-[#1D7CF3]">{faskes.operatingHours}</p>

      {/* Distance and Duration */}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{faskes.duration} menit</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{faskes.distance} km</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewDetail(faskes)}
          className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Lihat Detail
        </button>
        <button
          onClick={() => onRoute(faskes)}
          className="flex-1 rounded-lg bg-[#1D7CF3] py-2 text-xs font-medium text-white transition-colors hover:bg-[#1565D8]"
        >
          Rute
        </button>
      </div>
    </motion.div>
  );
}

// Detail Modal Component
function DetailModal({
  faskes,
  onClose,
  onRoute,
}: {
  faskes: Faskes;
  onClose: () => void;
  onRoute: (faskes: Faskes) => void;
}) {
  const typeColor = getTypeColor(faskes.type);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Image */}
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={faskes.image}
            alt={faskes.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%23E5E7EB' width='400' height='200'/%3E%3Ctext fill='%239CA3AF' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Type Badge */}
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${typeColor.bg} ${typeColor.text}`}>
            {getFacilityTypeLabel(faskes.type)}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name */}
          <h2 className="text-lg font-bold text-gray-800">{faskes.name}</h2>

          {/* Address */}
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {faskes.address}
            {faskes.city && faskes.province && (
              <span className="block mt-1 text-gray-500">
                {faskes.city}, {faskes.province}
              </span>
            )}
          </p>

          {/* Info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-[#1D7CF3]" />
              <span>{faskes.operatingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-[#1D7CF3]" />
              <span>{faskes.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[#1D7CF3]" />
              <span>{faskes.distance} km dari lokasi Anda ({faskes.duration} menit)</span>
            </div>
          </div>

          {/* Route Button */}
          <button
            onClick={() => onRoute(faskes)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D7CF3] py-3 text-sm font-medium text-white transition-colors hover:bg-[#1565D8]"
          >
            <Navigation className="h-4 w-4" />
            Buka di Google Maps
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Default location: Jakarta Pusat (area where most faskes data is located)
const DEFAULT_LOCATION = { lat: -6.2088, lng: 106.8456 };

export default function CariFaskesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [faskesData, setFaskesData] = useState<Faskes[]>([]);
  const [selectedFaskes, setSelectedFaskes] = useState<Faskes | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Start with default location (Jakarta Pusat) immediately
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setLocationError(null);
    setIsGettingLocation(true);
    
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi. Menggunakan lokasi default (Jakarta).");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (error) => {
        console.log("Geolocation error:", error);
        let errorMessage = "Menggunakan lokasi default (Jakarta)";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Izin lokasi ditolak. Menggunakan lokasi default (Jakarta).";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Lokasi tidak tersedia. Menggunakan lokasi default (Jakarta).";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout mendapatkan lokasi. Menggunakan lokasi default (Jakarta).";
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
        // Keep using the default location (Jakarta), don't change it
      },
      {
        enableHighAccuracy: false, // Set to false for faster response
        timeout: 15000, // Increase timeout to 15 seconds
        maximumAge: 600000, // Cache location for 10 minutes
      }
    );
  }, []);

  // Fetch facilities from backend
  const fetchFaskesData = useCallback(async () => {
    if (!userLocation) return;
    
    setIsLoading(true);
    
    try {
      const response = await getNearbyFacilities({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius_km: radiusKm,
        limit: 100,
      });

      console.log("API Response:", response); // Debug log

      // Backend returns { facilities: [...] } format
      let facilities: HealthcareFacility[] = [];
      if (response && typeof response === 'object') {
        // Check for 'facilities' field (backend format)
        if ('facilities' in response && Array.isArray(response.facilities)) {
          facilities = response.facilities;
        }
        // Fallback: check for 'data' field
        else if ('data' in response && Array.isArray((response as { data: HealthcareFacility[] }).data)) {
          facilities = (response as { data: HealthcareFacility[] }).data;
        }
        // Fallback: response itself is array
        else if (Array.isArray(response)) {
          facilities = response as unknown as HealthcareFacility[];
        }
      }
      
      console.log("Facilities found:", facilities.length); // Debug log
      
      const faskesArray = facilities.map(convertToFaskes);
      
      // Sort by distance
      faskesArray.sort((a, b) => a.distance - b.distance);
      
      setFaskesData(faskesArray);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setFaskesData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, radiusKm]);

  // Fetch facilities immediately on mount with default location
  useEffect(() => {
    // Fetch with default/current location immediately
    fetchFaskesData();
    // Also try to get user's actual location
    getUserLocation();
  }, []); // Only run once on mount

  // Refetch when location or radius changes
  useEffect(() => {
    if (userLocation) {
      fetchFaskesData();
    }
  }, [userLocation, radiusKm, fetchFaskesData]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    getUserLocation();
    await fetchFaskesData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter faskes based on search and filter
  const filteredFaskes = useMemo(() => {
    let result = faskesData;

    if (activeFilter !== "semua") {
      result = result.filter((f) => f.type === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.address.toLowerCase().includes(query) ||
          (f.city && f.city.toLowerCase().includes(query))
      );
    }

    return result;
  }, [searchQuery, activeFilter, faskesData]);

  // Handle view detail
  const handleViewDetail = (faskes: Faskes) => {
    setSelectedFaskes(faskes);
    setShowDetailModal(true);
  };

  // Handle route (open Google Maps)
  const handleRoute = (faskes: Faskes) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${faskes.latitude},${faskes.longitude}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`;
    window.open(url, "_blank");
  };

  // Handle marker click
  const handleMarkerClick = (faskes: Faskes) => {
    setSelectedFaskes(faskes);
    setShowDetailModal(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Navbar */}
      <div className="absolute left-0 right-0 top-0 z-[500] bg-white/95 backdrop-blur-sm">
        <Navbar />
      </div>

      {/* Map Container - Full Screen */}
      <div className="absolute inset-0 pt-16 lg:pt-20">
        <MapComponent
          faskesList={filteredFaskes}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          selectedFaskes={selectedFaskes}
        />
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute bottom-4 left-4 top-24 z-[500] w-80 overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm lg:top-28"
      >
        <div className="flex h-full flex-col p-4">
          {/* Header with Refresh */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Fasilitas Kesehatan Terdekat
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh lokasi"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Location Status */}
          {locationError && (
            <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
          
          {isGettingLocation && !locationError && (
            <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
              <span>Mencari lokasi Anda...</span>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau lokasi faskes..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeFilter === option.value
                    ? "bg-[#1D7CF3] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Radius Selector */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <span>Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-[#1D7CF3] focus:outline-none"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
            <span className="text-gray-400">
              ({filteredFaskes.length} ditemukan)
            </span>
          </div>

          {/* Results List */}
          <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#1D7CF3]" />
                <span className="mt-2 text-sm text-gray-500">Mencari faskes terdekat...</span>
              </div>
            ) : filteredFaskes.length > 0 ? (
              filteredFaskes.map((faskes) => (
                <FaskesCard
                  key={faskes.id}
                  faskes={faskes}
                  onViewDetail={handleViewDetail}
                  onRoute={handleRoute}
                />
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <MapPin className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  {faskesData.length === 0
                    ? "Tidak ada faskes dalam radius ini"
                    : "Tidak ada hasil ditemukan"}
                </p>
                {faskesData.length === 0 && (
                  <button
                    onClick={() => setRadiusKm(radiusKm + 10)}
                    className="mt-2 text-xs text-[#1D7CF3] hover:underline"
                  >
                    Perluas radius pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedFaskes && (
          <DetailModal
            faskes={selectedFaskes}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedFaskes(null);
            }}
            onRoute={handleRoute}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

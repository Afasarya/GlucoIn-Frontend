"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Search, Clock, MapPin, Phone, X } from "lucide-react";
import Navbar from "@/app/components/common/Navbar";
import type { ComponentType } from "react";

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
        <div className="text-gray-500">Memuat peta...</div>
      </div>
    ),
  }
);

// Types
interface Faskes {
  id: string;
  name: string;
  type: "rumah-sakit" | "klinik" | "lab";
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  phone: string;
  distance: number; // in km
  duration: number; // in minutes
  image: string;
}

// Filter options
const filterOptions = [
  { value: "semua", label: "Semua" },
  { value: "rumah-sakit", label: "Rumah Sakit" },
  { value: "klinik", label: "Klinik" },
  { value: "lab", label: "Lab" },
];

// Default faskes data (will be replaced by API data)
const defaultFaskesData: Faskes[] = [
  {
    id: "1",
    name: "Rumah Sakit Umum Hermina Pandanaran",
    type: "rumah-sakit",
    address:
      "RS Hermina Pandanaran, Jl. Pandanaran No.45 Lantai 6, Pekunden, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50134",
    latitude: -6.9932,
    longitude: 110.4203,
    operatingHours: "Buka 24 jam",
    phone: "(024) 1729301",
    distance: 1.2,
    duration: 5,
    image: "/images/assets/faskes-1.jpg",
  },
  {
    id: "2",
    name: "Rumah Sakit Umum Hermina Pandanaran",
    type: "klinik",
    address:
      "RS Hermina Pandanaran, Jl. Pandanaran No.45 Lantai 6, Pekunden, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50134",
    latitude: -6.9875,
    longitude: 110.4156,
    operatingHours: "07.00 - 20.00",
    phone: "(024) 1729301",
    distance: 1.2,
    duration: 5,
    image: "/images/assets/faskes-1.jpg",
  },
  {
    id: "3",
    name: "Rumah Sakit Umum Hermina Pandanaran",
    type: "lab",
    address:
      "RS Hermina Pandanaran, Jl. Pandanaran No.45 Lantai 6, Pekunden, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50134",
    latitude: -6.9898,
    longitude: 110.4225,
    operatingHours: "Buka 24 jam",
    phone: "(024) 1729301",
    distance: 1.2,
    duration: 5,
    image: "/images/assets/faskes-1.jpg",
  },
  {
    id: "4",
    name: "SMC Rumah Sakit Telogorejo Semarang",
    type: "rumah-sakit",
    address:
      "Jl. KH. Ahmad Dahlan No.1, Pekunden, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50134",
    latitude: -6.9845,
    longitude: 110.4312,
    operatingHours: "Buka 24 jam",
    phone: "(024) 8415555",
    distance: 2.5,
    duration: 10,
    image: "/images/assets/faskes-1.jpg",
  },
  {
    id: "5",
    name: "Klinik Pandawa Medika",
    type: "klinik",
    address:
      "Jl. Pandanaran No.82, Pekunden, Kec. Semarang Tengah, Kota Semarang, Jawa Tengah 50134",
    latitude: -6.9912,
    longitude: 110.4178,
    operatingHours: "08.00 - 21.00",
    phone: "(024) 8411234",
    distance: 0.8,
    duration: 3,
    image: "/images/assets/faskes-1.jpg",
  },
  {
    id: "6",
    name: "Laboratorium Prodia Semarang",
    type: "lab",
    address:
      "Jl. Sultan Agung No.123, Candisari, Kec. Candisari, Kota Semarang, Jawa Tengah 50252",
    latitude: -7.0012,
    longitude: 110.4256,
    operatingHours: "07.00 - 17.00",
    phone: "(024) 8312345",
    distance: 3.1,
    duration: 12,
    image: "/images/assets/faskes-1.jpg",
  },
];

// Get type label
function getTypeLabel(type: Faskes["type"]): string {
  switch (type) {
    case "rumah-sakit":
      return "Rumah Sakit";
    case "klinik":
      return "Klinik";
    case "lab":
      return "Lab";
    default:
      return type;
  }
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      {/* Type Label */}
      <span className="text-xs font-medium text-[#1D7CF3]">
        {getTypeLabel(faskes.type)}
      </span>

      {/* Name */}
      <h3 className="mt-1 text-sm font-bold text-gray-800">{faskes.name}</h3>

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
}: {
  faskes: Faskes;
  onClose: () => void;
}) {
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
              // Fallback for missing image
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
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name */}
          <h2 className="text-lg font-bold text-gray-800">{faskes.name}</h2>

          {/* Address */}
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {faskes.address}
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CariFaskesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [faskesData, setFaskesData] = useState<Faskes[]>(defaultFaskesData);
  const [selectedFaskes, setSelectedFaskes] = useState<Faskes | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(
    { lat: -6.9932, lng: 110.4203 } // Default to Semarang city center
  );

  // Get user location on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Keep default Semarang location
        }
      );
    }
  }, []);

  // Filter faskes based on search and filter using useMemo
  const filteredFaskes = useMemo(() => {
    let result = faskesData;

    // Filter by type
    if (activeFilter !== "semua") {
      result = result.filter((f) => f.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.address.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeFilter, faskesData]);

  // Fetch faskes data from backend (placeholder)
  const fetchFaskesData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/faskes');
      // const data = await response.json();
      // setFaskesData(data);
      
      // Using default data for now
      setFaskesData(defaultFaskesData);
    } catch (error) {
      console.error("Error fetching faskes data:", error);
    }
  }, []);

  useEffect(() => {
    fetchFaskesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle view detail
  const handleViewDetail = (faskes: Faskes) => {
    setSelectedFaskes(faskes);
    setShowDetailModal(true);
  };

  // Handle route (open Google Maps)
  const handleRoute = (faskes: Faskes) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${faskes.latitude},${faskes.longitude}`;
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
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan lokasi atau nama klinik"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#1D7CF3] focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === option.value
                    ? "bg-[#1D7CF3] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {filteredFaskes.length > 0 ? (
              filteredFaskes.map((faskes) => (
                <FaskesCard
                  key={faskes.id}
                  faskes={faskes}
                  onViewDetail={handleViewDetail}
                  onRoute={handleRoute}
                />
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                Tidak ada hasil ditemukan
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}

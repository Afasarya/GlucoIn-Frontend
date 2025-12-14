"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types - Updated to match backend types
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

interface MapComponentProps {
  faskesList: Faskes[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (faskes: Faskes) => void;
  selectedFaskes: Faskes | null;
}

// Get marker color based on facility type
function getMarkerColor(type: Faskes["type"]): string {
  const colors: Record<string, string> = {
    HOSPITAL: "#EF4444",    // Red
    PHARMACY: "#22C55E",    // Green
    CLINIC: "#3B82F6",      // Blue
    PUSKESMAS: "#F97316",   // Orange
    LAB: "#8B5CF6",         // Purple
  };
  return colors[type] || "#1E293B";
}

// Custom marker icon with type-based colors
const createMarkerIcon = (type: Faskes["type"], isSelected: boolean = false) => {
  const color = isSelected ? "#F97316" : getMarkerColor(type);
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// User location marker icon
const userMarkerIcon = L.divIcon({
  className: "user-marker",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #1D7CF3;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(29,124,243,0.5);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapComponent({
  faskesList,
  userLocation,
  onMarkerClick,
  selectedFaskes,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use userLocation if available, otherwise default to Semarang
    const center: L.LatLngExpression = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [-6.9932, 110.4203];

    // Create map
    mapRef.current = L.map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    hasInitializedRef.current = true;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        hasInitializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Add new user marker
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userMarkerIcon,
      zIndexOffset: 1000, // Make sure user marker is on top
    })
      .addTo(mapRef.current)
      .bindPopup("Lokasi Anda");

    // Center map on user location only if this is an update (not initial load)
    if (hasInitializedRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [userLocation]);

  // Update faskes markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    faskesList.forEach((faskes) => {
      const isSelected = selectedFaskes?.id === faskes.id;
      const marker = L.marker([faskes.latitude, faskes.longitude], {
        icon: createMarkerIcon(faskes.type, isSelected),
      })
        .addTo(mapRef.current!)
        .on("click", () => {
          onMarkerClick(faskes);
        });

      // Add tooltip on hover with distance info
      marker.bindTooltip(`${faskes.name} (${faskes.distance} km)`, {
        direction: "top",
        offset: [0, -32],
      });

      markersRef.current.push(marker);
    });

    // If we have markers and a user location, fit bounds to show all markers
    if (faskesList.length > 0 && userLocation && mapRef.current) {
      const allPoints: L.LatLngExpression[] = [
        [userLocation.lat, userLocation.lng],
        ...faskesList.map((f) => [f.latitude, f.longitude] as L.LatLngExpression),
      ];
      
      // Only fit bounds if there are multiple points
      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints);
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
        });
      }
    }
  }, [faskesList, selectedFaskes, onMarkerClick, userLocation]);

  // Pan to selected faskes
  useEffect(() => {
    if (!mapRef.current || !selectedFaskes) return;

    mapRef.current.panTo([selectedFaskes.latitude, selectedFaskes.longitude], {
      animate: true,
      duration: 0.5,
    });
  }, [selectedFaskes]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ background: "#e5e7eb" }}
    />
  );
}

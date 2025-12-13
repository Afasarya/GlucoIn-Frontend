"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  distance: number;
  duration: number;
  image: string;
}

interface MapComponentProps {
  faskesList: Faskes[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (faskes: Faskes) => void;
  selectedFaskes: Faskes | null;
}

// Custom marker icon
const createMarkerIcon = (isSelected: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${isSelected ? "#F97316" : "#1E293B"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 12px;
          height: 12px;
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Semarang)
    const defaultCenter: L.LatLngExpression = [-6.9932, 110.4203];

    // Create map
    mapRef.current = L.map(mapContainerRef.current, {
      center: userLocation
        ? [userLocation.lat, userLocation.lng]
        : defaultCenter,
      zoom: 14,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
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
    })
      .addTo(mapRef.current)
      .bindPopup("Lokasi Anda");

    // Center map on user location
    mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
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
        icon: createMarkerIcon(isSelected),
      })
        .addTo(mapRef.current!)
        .on("click", () => {
          onMarkerClick(faskes);
        });

      // Add tooltip on hover
      marker.bindTooltip(faskes.name, {
        direction: "top",
        offset: [0, -32],
      });

      markersRef.current.push(marker);
    });
  }, [faskesList, selectedFaskes, onMarkerClick]);

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

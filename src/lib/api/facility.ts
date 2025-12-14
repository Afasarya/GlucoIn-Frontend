// Facility API Service
import { buildUrl } from './config';
import type {
  HealthcareFacility,
  NearbyFacilitiesParams,
  NearbyFacilitiesResponse,
  NearbyGroupedResponse,
  FacilityDetailResponse,
} from '../types/facility';

// Helper function for public API calls (no auth required)
async function publicRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      success: false,
      message: data.message || 'Terjadi kesalahan',
      statusCode: response.status,
    };
  }

  return data;
}

// ============= FACILITY API =============

/**
 * Get nearby healthcare facilities based on user location
 * Uses Haversine formula for distance calculation
 */
export async function getNearbyFacilities(
  params: NearbyFacilitiesParams
): Promise<NearbyFacilitiesResponse> {
  const searchParams = new URLSearchParams();
  
  searchParams.append('latitude', params.latitude.toString());
  searchParams.append('longitude', params.longitude.toString());
  
  if (params.radius_km) {
    searchParams.append('radius_km', params.radius_km.toString());
  }
  if (params.type) {
    searchParams.append('type', params.type);
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  
  const query = searchParams.toString();
  return publicRequest<NearbyFacilitiesResponse>(`/facilities/nearby?${query}`);
}

/**
 * Get nearby facilities grouped by type
 */
export async function getNearbyFacilitiesGrouped(
  params: NearbyFacilitiesParams
): Promise<NearbyGroupedResponse> {
  const searchParams = new URLSearchParams();
  
  searchParams.append('latitude', params.latitude.toString());
  searchParams.append('longitude', params.longitude.toString());
  
  if (params.radius_km) {
    searchParams.append('radius_km', params.radius_km.toString());
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  
  const query = searchParams.toString();
  return publicRequest<NearbyGroupedResponse>(`/facilities/nearby/grouped?${query}`);
}

/**
 * Get all facilities with optional type filter
 */
export async function getAllFacilities(
  type?: string
): Promise<HealthcareFacility[]> {
  const query = type ? `?type=${type}` : '';
  return publicRequest<HealthcareFacility[]>(`/facilities${query}`);
}

/**
 * Get facility by ID
 */
export async function getFacilityById(
  id: string
): Promise<FacilityDetailResponse> {
  return publicRequest<FacilityDetailResponse>(`/facilities/${id}`);
}

/**
 * Calculate estimated duration based on distance
 * Assumes average speed of 30 km/h in urban areas
 */
export function calculateDuration(distanceKm: number): number {
  const avgSpeedKmh = 30; // Average urban speed
  const durationHours = distanceKm / avgSpeedKmh;
  return Math.round(durationHours * 60); // Convert to minutes
}

/**
 * Get facility type label in Indonesian
 */
export function getFacilityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOSPITAL: 'Rumah Sakit',
    PHARMACY: 'Apotek',
    CLINIC: 'Klinik',
    PUSKESMAS: 'Puskesmas',
    LAB: 'Laboratorium',
  };
  return labels[type] || type;
}

/**
 * Get facility type color class
 */
export function getFacilityTypeColor(type: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    HOSPITAL: { bg: 'bg-red-100', text: 'text-red-700' },
    PHARMACY: { bg: 'bg-green-100', text: 'text-green-700' },
    CLINIC: { bg: 'bg-blue-100', text: 'text-blue-700' },
    PUSKESMAS: { bg: 'bg-orange-100', text: 'text-orange-700' },
    LAB: { bg: 'bg-purple-100', text: 'text-purple-700' },
  };
  return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
}

/**
 * Format operating hours
 */
export function formatOperatingHours(
  isOpen24h: boolean,
  openingTime?: string,
  closingTime?: string
): string {
  if (isOpen24h) {
    return 'Buka 24 Jam';
  }
  if (openingTime && closingTime) {
    return `${openingTime} - ${closingTime}`;
  }
  return 'Jam operasional tidak tersedia';
}

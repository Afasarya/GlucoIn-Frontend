// Facility Types

export type FacilityType = 
  | 'HOSPITAL'
  | 'PHARMACY'
  | 'CLINIC'
  | 'PUSKESMAS'
  | 'LAB';

export interface HealthcareFacility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  city: string;
  province: string;
  phone?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  rating?: number;
  rating_count?: number;
  is_open_24h: boolean;
  opening_time?: string;
  closing_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields from nearby search
  distance_km?: number;
  duration_minutes?: number;
}

export interface NearbyFacilitiesParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  type?: FacilityType;
  limit?: number;
}

export interface FacilitiesResponse {
  data: HealthcareFacility[];
}

export interface FacilityDetailResponse {
  data: HealthcareFacility;
}

// Response format from backend /facilities/nearby
export interface NearbyFacilitiesResponse {
  message: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  count: number;
  facilities: HealthcareFacility[];
}

// Response format from backend /facilities/nearby/grouped
export interface NearbyGroupedResponse {
  message: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
  count: number;
  facilities: {
    HOSPITAL: HealthcareFacility[];
    PHARMACY: HealthcareFacility[];
    CLINIC: HealthcareFacility[];
    PUSKESMAS: HealthcareFacility[];
    LAB: HealthcareFacility[];
  };
}

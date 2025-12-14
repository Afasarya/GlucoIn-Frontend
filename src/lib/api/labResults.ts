// Lab Results OCR API for Glucoin
// API endpoint: https://glucoinapi.mentorit.my.id/lab-results

import { API_CONFIG } from './config';

const LAB_RESULTS_BASE_URL = `${API_CONFIG.BASE_URL}/lab-results`;

// Types for lab result status
export type LabStatus = 'NORMAL' | 'TINGGI' | 'RENDAH' | 'KRITIS';

// Lab value with status
export interface LabValue {
  value: number;
  status: LabStatus;
  unit: string;
}

// Lab result data structure
export interface LabResultData {
  id: string;
  image_url: string;
  lab_name: string | null;
  test_date: string | null;

  gula_darah: {
    gdp: LabValue | null; // Gula Darah Puasa
    gd2pp: LabValue | null; // Gula Darah 2 Jam PP
    gds: LabValue | null; // Gula Darah Sewaktu
    hba1c: LabValue | null;
  };

  profil_lipid: {
    cholesterol_total: LabValue | null;
    ldl: LabValue | null;
    hdl: LabValue | null;
    triglycerides: LabValue | null;
  };

  fungsi_ginjal: {
    creatinine: LabValue | null;
    urea: LabValue | null;
    uric_acid: LabValue | null;
  };

  fungsi_hati: {
    sgot: LabValue | null;
    sgpt: LabValue | null;
  };

  darah_lengkap: {
    hemoglobin: LabValue | null;
    hematocrit: LabValue | null;
    leukocytes: LabValue | null;
    platelets: LabValue | null;
    erythrocytes: LabValue | null;
  };

  tekanan_darah: {
    systolic: number;
    diastolic: number;
    display: string;
  } | null;

  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

// Scan response
export interface ScanLabResultResponse {
  status: 'ok' | 'error';
  message: string;
  data: LabResultData;
}

// History response
export interface LabResultHistoryResponse {
  status: 'ok' | 'error';
  data: LabResultData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Latest response
export interface LatestLabResultResponse {
  status: 'ok' | 'error';
  data: LabResultData | null;
  message?: string;
}

// Summary trend item
export interface TrendItem {
  date: string;
  gdp: number | null;
  gd2pp: number | null;
  hba1c: number | null;
  cholesterol_total: number | null;
}

// Summary response
export interface LabResultSummaryResponse {
  status: 'ok' | 'error';
  data: {
    latest: {
      gdp: { value: number; status: LabStatus } | null;
      gd2pp: { value: number; status: LabStatus } | null;
      hba1c: { value: number; status: LabStatus } | null;
      cholesterol_total: { value: number; status: LabStatus } | null;
      ldl: { value: number; status: LabStatus } | null;
      hdl: { value: number; status: LabStatus } | null;
      triglycerides: { value: number; status: LabStatus } | null;
      creatinine: { value: number; status: LabStatus } | null;
      uric_acid: { value: number; status: LabStatus } | null;
    };
    trend: TrendItem[];
    last_updated: string;
  } | null;
  message?: string;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('glucoin_token');
  }
  return null;
}

// Scan lab result photo using AI OCR (requires auth)
export async function scanLabResult(imageFile: File): Promise<ScanLabResultResponse> {
  const token = getAuthToken();
  console.log('Token found:', token ? 'Yes' : 'No');
  console.log('Token value:', token?.substring(0, 20) + '...');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  
  console.log('Uploading to:', `${LAB_RESULTS_BASE_URL}/scan`);
  console.log('File:', imageFile.name, imageFile.size, imageFile.type);

  const response = await fetch(`${LAB_RESULTS_BASE_URL}/scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  console.log('Response status:', response.status);
  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (!response.ok) {
    let error;
    try {
      error = JSON.parse(responseText);
    } catch {
      error = { message: responseText || 'Failed to scan lab result' };
    }
    throw new Error(error.message || `Error ${response.status}: Failed to scan lab result`);
  }

  return JSON.parse(responseText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to scan lab result' }));
    throw new Error(error.message || 'Failed to scan lab result');
  }

  return response.json();
}

// Get lab result history (requires auth)
export async function getLabResultHistory(
  page: number = 1,
  limit: number = 10
): Promise<LabResultHistoryResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${LAB_RESULTS_BASE_URL}?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get lab results' }));
    throw new Error(error.message || 'Failed to get lab results');
  }

  return response.json();
}

// Get latest lab result (requires auth)
export async function getLatestLabResult(): Promise<LatestLabResultResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${LAB_RESULTS_BASE_URL}/latest`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get latest lab result' }));
    throw new Error(error.message || 'Failed to get latest lab result');
  }

  return response.json();
}

// Get lab results summary with trends (requires auth)
export async function getLabResultSummary(): Promise<LabResultSummaryResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${LAB_RESULTS_BASE_URL}/summary`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get summary' }));
    throw new Error(error.message || 'Failed to get summary');
  }

  return response.json();
}

// Get lab result by ID (requires auth)
export async function getLabResultById(id: string): Promise<{ status: string; data: LabResultData }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${LAB_RESULTS_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Lab result not found' }));
    throw new Error(error.message || 'Lab result not found');
  }

  return response.json();
}

// Delete lab result (requires auth)
export async function deleteLabResult(id: string): Promise<{ status: string; message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${LAB_RESULTS_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete lab result' }));
    throw new Error(error.message || 'Failed to delete lab result');
  }

  return response.json();
}

// Helper function to get status color
export function getStatusColor(status: LabStatus): string {
  switch (status) {
    case 'NORMAL':
      return '#22C55E'; // Green
    case 'TINGGI':
      return '#F59E0B'; // Orange/Amber
    case 'RENDAH':
      return '#3B82F6'; // Blue
    case 'KRITIS':
      return '#EF4444'; // Red
    default:
      return '#64748B'; // Gray
  }
}

// Helper function to get status label
export function getStatusLabel(status: LabStatus): string {
  switch (status) {
    case 'NORMAL':
      return 'Normal';
    case 'TINGGI':
      return 'Tinggi';
    case 'RENDAH':
      return 'Rendah';
    case 'KRITIS':
      return 'Kritis';
    default:
      return 'Tidak Diketahui';
  }
}

// Helper function to get status badge style
export function getStatusBadgeClass(status: LabStatus): string {
  switch (status) {
    case 'NORMAL':
      return 'bg-green-100 text-green-700';
    case 'TINGGI':
      return 'bg-amber-100 text-amber-700';
    case 'RENDAH':
      return 'bg-blue-100 text-blue-700';
    case 'KRITIS':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

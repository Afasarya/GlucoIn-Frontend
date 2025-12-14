// Dashboard API Service
import { storage } from '../hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glucoinapi.mentorit.my.id';

// Use proxy in browser to avoid CORS
function buildUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  if (typeof window !== 'undefined') {
    return `/api/proxy/${cleanEndpoint}`;
  }
  return `${API_URL}/${cleanEndpoint}`;
}

// ============= TYPES =============

// Booking Types
export interface BookingDoctor {
  id: string;
  specialization: string;
  alamat_praktek?: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  consultation_type: 'ONLINE' | 'OFFLINE';
  consultation_type_label: string;
  consultation_fee: number;
  status: 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  status_label: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  payment_status_label: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  doctor?: BookingDoctor;
}

// Detection Types
export interface Detection {
  id: string;
  type: 'IMAGE' | 'QUESTIONNAIRE' | 'COMBINED' | 'FULL_SCREENING';
  risk_level: string;
  risk_score: number;
  accuracy: number;
  recommendations: string[];
  created_at: string;
  tongue_image_url?: string;
  nail_image_url?: string;
}

export interface DetectionStats {
  total: number;
  by_risk_level: {
    NORMAL: number;
    SEDANG: number;
    TINGGI: number;
  };
}

// Daily Task Types
export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  icon_color?: string;
  scheduled_time?: string;
  is_completed: boolean;
  completed_at?: string;
  task_type: string;
}

export interface DailyTaskProgress {
  date: string;
  progress: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
  tasks: DailyTask[];
}

// Lab Result Types
export interface LabResultMetric {
  name: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
  reference_range: string;
}

export interface LabResult {
  id: string;
  image_url?: string;
  metrics: LabResultMetric[];
  ai_analysis?: string;
  overall_status: string;
  created_at: string;
}

export interface LabSummary {
  latest_metrics: {
    gula_darah_puasa?: number;
    gula_darah_2_jam?: number;
    hba1c?: number;
    hemoglobin?: number;
    kolesterol?: number;
  };
  trends: {
    metric: string;
    values: { date: string; value: number }[];
  }[];
}

// Chat Types
export interface ChatRoom {
  id: string;
  booking_id?: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    avatar?: string;
  };
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
}

// Glucose Stats Types
export interface GlucoseStats {
  period: string;
  average: number;
  min: number;
  max: number;
  count: number;
  data: { date: string; value: number; category: string }[];
}

// ============= API HELPER =============

async function authRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  if (!token) {
    throw new Error('Tidak ada token autentikasi. Silakan login kembali.');
  }

  const url = buildUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
}

// ============= BOOKING API =============

export async function getMyBookings(status?: string): Promise<Booking[]> {
  const query = status ? `?status=${status}` : '';
  const data = await authRequest<{ bookings: Booking[] }>(`bookings/my-bookings${query}`);
  return data.bookings || [];
}

export async function getBookingById(id: string): Promise<Booking> {
  const data = await authRequest<{ booking: Booking }>(`bookings/${id}`);
  return data.booking;
}

// ============= DETECTION API =============

export async function getDetectionHistory(options?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{ data: Detection[]; pagination: { total: number; page: number; limit: number } }> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.type) params.append('type', options.type);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return authRequest(`detection/history${query}`);
}

export async function getDetectionStats(): Promise<{ status: string; stats: DetectionStats }> {
  return authRequest('detection/stats');
}

export async function getLatestDetection(): Promise<Detection | null> {
  const data = await authRequest<{ data: Detection | null }>('detection/latest');
  return data.data;
}

// ============= DAILY TASK API =============

export async function getTodayTasks(): Promise<DailyTaskProgress> {
  const data = await authRequest<{ status: string; data: DailyTaskProgress }>('daily-tasks/today');
  return data.data;
}

export async function getTasksByDate(date: string): Promise<DailyTaskProgress> {
  const data = await authRequest<{ status: string; data: DailyTaskProgress }>(`daily-tasks/by-date?date=${date}`);
  return data.data;
}

export async function completeTask(taskId: string, notes?: string): Promise<DailyTask> {
  const data = await authRequest<{ status: string; data: DailyTask }>(`daily-tasks/${taskId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
  return data.data;
}

export async function uncompleteTask(taskId: string): Promise<DailyTask> {
  const data = await authRequest<{ status: string; data: DailyTask }>(`daily-tasks/${taskId}/uncomplete`, {
    method: 'POST',
  });
  return data.data;
}

export async function getWeeklyProgress(): Promise<{ days: { date: string; percentage: number }[] }> {
  const data = await authRequest<{ status: string; data: { days: { date: string; percentage: number }[] } }>('daily-tasks/stats/weekly');
  return data.data;
}

export async function setupDefaultTasks(): Promise<void> {
  await authRequest('daily-tasks/templates/setup-defaults', { method: 'POST' });
}

// ============= LAB RESULT API =============

export async function getLabHistory(page = 1, limit = 10): Promise<{ data: LabResult[]; pagination: { total: number } }> {
  return authRequest(`lab-results?page=${page}&limit=${limit}`);
}

export async function getLatestLabResult(): Promise<LabResult | null> {
  const data = await authRequest<{ status: string; data: LabResult | null }>('lab-results/latest');
  return data.data;
}

export async function getLabSummary(): Promise<LabSummary> {
  const data = await authRequest<{ status: string; data: LabSummary }>('lab-results/summary');
  return data.data;
}

export async function uploadLabResult(file: File): Promise<LabResult> {
  const token = storage.getToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('image', file);

  const url = buildUrl('lab-results/scan');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Upload failed');
  return data.data;
}

// ============= CHAT API =============

export async function getChatRooms(): Promise<ChatRoom[]> {
  const data = await authRequest<{ rooms: ChatRoom[] }>('chat/rooms');
  return data.rooms || [];
}

export async function getOrCreateChatRoom(doctorId: string, bookingId?: string): Promise<ChatRoom> {
  const data = await authRequest<{ room: ChatRoom }>('chat/room', {
    method: 'POST',
    body: JSON.stringify({ doctorId, bookingId }),
  });
  return data.room;
}

export async function getChatMessages(roomId: string, page = 1, limit = 50): Promise<{
  messages: ChatMessage[];
  pagination: { total: number; page: number };
}> {
  return authRequest(`chat/room/${roomId}/messages?page=${page}&limit=${limit}`);
}

export async function markMessagesAsRead(roomId: string): Promise<void> {
  await authRequest(`chat/room/${roomId}/read`, { method: 'POST' });
}

// ============= HEALTH/GLUCOSE API =============

export async function getGlucoseStats(period: 'week' | 'month' | 'year' = 'week'): Promise<GlucoseStats> {
  const data = await authRequest<{ stats: GlucoseStats }>(`health/glucose/stats?period=${period}`);
  return data.stats;
}

export async function getGlucoseLogs(options?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
}): Promise<{ logs: { glucose_level: number; category: string; measured_at: string }[] }> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('start_date', options.startDate);
  if (options?.endDate) params.append('end_date', options.endDate);
  if (options?.category) params.append('category', options.category);
  if (options?.limit) params.append('limit', options.limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return authRequest(`health/glucose${query}`);
}

export async function getHealthDashboard(): Promise<{
  user: { full_name: string; diabetes_type?: string };
  today: { readings: number; average: number | null };
  weekly_stats: GlucoseStats;
  active_reminders: number;
}> {
  return authRequest('health/dashboard');
}

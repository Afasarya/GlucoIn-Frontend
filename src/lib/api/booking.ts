// Booking Doctor API Service
import { storage } from '../hooks/useAuth';

// ============= API CONFIG =============

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glucoinapi.mentorit.my.id';

// Use proxy in development to avoid CORS issues
function buildBookingUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // In browser, use proxy to avoid CORS
  if (typeof window !== 'undefined') {
    return `/api/proxy/${cleanEndpoint}`;
  }
  
  // Server-side, call directly
  return `${API_URL}/${cleanEndpoint}`;
}

// ============= TYPES =============

export interface DoctorUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  profile_picture_url?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  time_slot: string;
  duration_minutes: number;
  is_active: boolean;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  alamat_praktek?: string;
  price_range?: string;
  is_available: boolean;
  user: DoctorUser;
  schedules: DoctorSchedule[];
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  id: string;
  time_slot: string;
  duration_minutes: number;
  is_available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  day_of_week: string;
  slots: AvailableSlot[];
}

export interface BookingDoctor {
  id: string;
  specialization: string;
  alamat_praktek?: string;
  name: string;
  email: string;
  phone?: string;
}

export interface BookingUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface BookingSchedule {
  id: string;
  day_of_week: string;
  time_slot: string;
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
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  doctor?: BookingDoctor;
  user?: BookingUser;
  schedule?: BookingSchedule;
}

export interface PaymentInfo {
  order_id: string;
  amount: number;
  expiry_time: string;
  snap_token: string;
  snap_redirect_url: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
  payment: PaymentInfo;
}

export interface CreateBookingDto {
  doctor_id: string;
  schedule_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  consultation_type: 'ONLINE' | 'OFFLINE';
  consultation_fee: number;
  notes?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  booking_id?: string;
  order_payment_id?: string;
  amount: number;
  payment_type: string;
  status: string;
  snap_token?: string;
  snap_redirect_url?: string;
  expiry_time?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  payment: Payment;
  booking?: Booking;
}

// ============= API HELPER =============

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = storage.getToken();
  
  if (!token) {
    throw new Error('Tidak ada token autentikasi. Silakan login kembali.');
  }

  const url = buildBookingUrl(endpoint);
  
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function publicRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildBookingUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

// ============= DOCTOR API =============

/**
 * Get all available doctors
 */
export async function getAllDoctors(filters?: {
  specialization?: string;
  isAvailable?: boolean;
}): Promise<Doctor[]> {
  const params = new URLSearchParams();
  if (filters?.specialization) params.append('specialization', filters.specialization);
  if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return authenticatedRequest<Doctor[]>(`/doctors${query}`);
}

/**
 * Get available doctors only
 */
export async function getAvailableDoctors(): Promise<Doctor[]> {
  return authenticatedRequest<Doctor[]>('/doctors/available');
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${id}`);
}

/**
 * Get doctor schedules
 */
export async function getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
  return authenticatedRequest<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`);
}

/**
 * Get doctor schedules by day
 */
export async function getDoctorSchedulesByDay(
  doctorId: string,
  day: string
): Promise<DoctorSchedule[]> {
  return authenticatedRequest<DoctorSchedule[]>(`/doctors/${doctorId}/schedules/${day}`);
}

// ============= BOOKING API =============

/**
 * Get available slots for a doctor on a specific date
 */
export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<AvailableSlotsResponse> {
  return authenticatedRequest<AvailableSlotsResponse>(
    `/bookings/available-slots/${doctorId}?date=${date}`
  );
}

/**
 * Create a new booking
 */
export async function createBooking(
  data: CreateBookingDto
): Promise<CreateBookingResponse> {
  return authenticatedRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get user's bookings
 */
export async function getMyBookings(status?: string): Promise<Booking[]> {
  const query = status ? `?status=${status}` : '';
  return authenticatedRequest<Booking[]>(`/bookings/my-bookings${query}`);
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  return authenticatedRequest<Booking>(`/bookings/${id}`);
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  id: string,
  reason: string
): Promise<{ message: string; booking: Booking }> {
  return authenticatedRequest<{ message: string; booking: Booking }>(
    `/bookings/${id}/cancel`,
    {
      method: 'PATCH',
      body: JSON.stringify({ cancellation_reason: reason }),
    }
  );
}

// ============= PAYMENT API =============

/**
 * Create payment for booking
 */
export async function createPayment(bookingId: string): Promise<{
  message: string;
  payment: Payment;
  snap_token: string;
  snap_redirect_url: string;
}> {
  return authenticatedRequest(`/payments/create/${bookingId}`, {
    method: 'POST',
  });
}

/**
 * Get payment status
 */
export async function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  return authenticatedRequest<PaymentStatusResponse>(`/payments/status/${orderId}`);
}

/**
 * Get payment by booking ID
 */
export async function getPaymentByBookingId(bookingId: string): Promise<Payment> {
  return authenticatedRequest<Payment>(`/payments/booking/${bookingId}`);
}

/**
 * Get booking payment history
 */
export async function getBookingPaymentHistory(status?: string): Promise<Payment[]> {
  const query = status ? `?status=${status}` : '';
  return authenticatedRequest<Payment[]>(`/payments/history/booking${query}`);
}

/**
 * Cancel payment
 */
export async function cancelPayment(orderId: string): Promise<{ message: string }> {
  return authenticatedRequest(`/payments/cancel/${orderId}`, {
    method: 'POST',
  });
}

// ============= HELPER FUNCTIONS =============

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format short date
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time
 */
export function formatTime(time: string): string {
  return time.replace(':', '.');
}

/**
 * Get day name in Indonesian
 */
export function getDayName(day: string): string {
  const days: Record<string, string> = {
    MONDAY: 'Senin',
    TUESDAY: 'Selasa',
    WEDNESDAY: 'Rabu',
    THURSDAY: 'Kamis',
    FRIDAY: 'Jumat',
    SATURDAY: 'Sabtu',
    SUNDAY: 'Minggu',
  };
  return days[day] || day;
}

/**
 * Get day of week from date
 */
export function getDayOfWeek(date: Date): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
}

/**
 * Parse price range to get minimum price
 */
export function parsePriceRange(priceRange?: string): number {
  if (!priceRange) return 0;
  // Format: "Rp 150.000 - Rp 300.000"
  const match = priceRange.match(/Rp\s*([\d.]+)/);
  if (match) {
    return parseInt(match[1].replace(/\./g, ''));
  }
  return 0;
}

/**
 * Get booking status color
 */
export function getBookingStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING_PAYMENT: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    PENDING: { bg: 'bg-orange-50', text: 'text-orange-600' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-600' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-600' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-600' },
    EXPIRED: { bg: 'bg-gray-50', text: 'text-gray-600' },
  };
  return colors[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    PAID: { bg: 'bg-green-50', text: 'text-green-600' },
    FAILED: { bg: 'bg-red-50', text: 'text-red-600' },
    EXPIRED: { bg: 'bg-gray-50', text: 'text-gray-600' },
    REFUNDED: { bg: 'bg-purple-50', text: 'text-purple-600' },
  };
  return colors[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };
}

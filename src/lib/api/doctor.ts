// Doctor Dashboard API Service
import { buildUrl } from './config';
import { storage } from '../hooks/useAuth';

// ============= CACHED DOCTOR ID =============

let cachedDoctorId: string | null = null;

// Get cached doctor ID or fetch it from profile
async function getMyDoctorId(): Promise<string> {
  if (cachedDoctorId) {
    return cachedDoctorId;
  }
  const profile = await getMyDoctorProfile();
  cachedDoctorId = profile.id;
  return cachedDoctorId;
}

// Clear cached doctor ID (call on logout)
export function clearDoctorCache(): void {
  cachedDoctorId = null;
}

// ============= TYPES =============

// Doctor Types
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
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  str_number: string;
  experience_years: number;
  consultation_fee: number;
  is_available: boolean;
  bio?: string;
  education?: string;
  hospital_affiliation?: string;
  full_name?: string;
  profile_picture?: string;
  user: DoctorUser;
  schedules: DoctorSchedule[];
  created_at: string;
  updated_at: string;
}

// Booking/Appointment Types
export interface BookingPatient {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  gender?: 'MALE' | 'FEMALE';
  date_of_birth?: string;
  address?: string;
  profile_picture?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  doctor_id: string;
  schedule_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  consultation_type: 'ONLINE' | 'OFFLINE';
  consultation_fee: number;
  total_price?: number;
  status: 'PENDING_PAYMENT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  notes?: string;
  cancellation_reason?: string;
  user?: BookingPatient;
  doctor?: Doctor;
  schedule?: DoctorSchedule;
  created_at: string;
  updated_at: string;
}

// Income Types
export interface MonthlyIncome {
  month: string;
  income: number;
}

export interface DoctorIncome {
  period: string;
  total_income: number;
  total_bookings: number;
  average_per_booking: number;
  income_by_type: {
    ONLINE: number;
    OFFLINE: number;
  };
  monthly_income: MonthlyIncome[];
}

// Patients Types
export interface PatientInfo {
  user: BookingPatient;
  total_visits: number;
  last_visit: string;
  first_visit: string;
}

export interface DoctorPatients {
  total_unique_patients: number;
  total_consultations: number;
  consultations_by_type: {
    ONLINE: number;
    OFFLINE: number;
  };
  recent_patients: PatientInfo[];
}

// Appointment Types
export interface AppointmentDetail {
  id: string;
  patient: BookingPatient;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  consultation_type: 'ONLINE' | 'OFFLINE';
  consultation_fee: number;
  status: string;
  notes?: string;
}

export interface DoctorAppointments {
  total_upcoming: number;
  today_count: number;
  today_appointments: AppointmentDetail[];
  upcoming_by_date: Record<string, AppointmentDetail[]>;
  appointments: AppointmentDetail[];
}

// Dashboard Types
export interface DoctorDashboard {
  summary: {
    total_income_this_month: number;
    total_patients: number;
    total_consultations: number;
    upcoming_appointments: number;
    today_appointments: number;
    today_completed: number;
  };
  income: DoctorIncome;
  patients: {
    total: number;
    by_type: {
      ONLINE: number;
      OFFLINE: number;
    };
  };
  upcoming: AppointmentDetail[];
  monthly_chart: MonthlyIncome[];
}

// Chat Room Types
export interface ChatRoom {
  id: string;
  user_id: string;
  doctor_id: string;
  booking_id?: string;
  is_active: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  user?: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
  };
  doctor?: {
    id: string;
    user_id: string;
    full_name: string;
    profile_picture_url?: string;
    specialization: string;
  };
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_type: 'USER' | 'DOCTOR';
  message: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE';
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
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

// ============= DOCTOR PROFILE API =============

/**
 * Get current doctor's profile
 */
export async function getMyDoctorProfile(): Promise<Doctor> {
  const profile = await authenticatedRequest<Doctor>('/doctors/my-profile');
  // Cache the doctor ID for other API calls
  cachedDoctorId = profile.id;
  return profile;
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${id}`);
}

/**
 * Update doctor profile
 */
export async function updateDoctorProfile(
  id: string,
  data: Partial<Doctor>
): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Update doctor availability
 */
export async function updateDoctorAvailability(
  id: string,
  isAvailable: boolean
): Promise<Doctor> {
  return authenticatedRequest<Doctor>(`/doctors/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ is_available: isAvailable }),
  });
}

// ============= DOCTOR DASHBOARD API =============

/**
 * Get complete doctor dashboard
 */
export async function getMyDashboard(): Promise<DoctorDashboard> {
  const doctorId = await getMyDoctorId();
  return authenticatedRequest<DoctorDashboard>(`/doctors/${doctorId}/dashboard`);
}

/**
 * Get doctor dashboard by ID (for admin)
 */
export async function getDoctorDashboard(doctorId: string): Promise<DoctorDashboard> {
  return authenticatedRequest<DoctorDashboard>(`/doctors/${doctorId}/dashboard`);
}

// ============= DOCTOR INCOME API =============

/**
 * Get my income statistics
 */
export async function getMyIncome(
  period?: 'today' | 'week' | 'month' | 'year' | 'all'
): Promise<DoctorIncome> {
  const doctorId = await getMyDoctorId();
  const query = period ? `?period=${period}` : '';
  return authenticatedRequest<DoctorIncome>(`/doctors/${doctorId}/income${query}`);
}

/**
 * Get doctor income by ID
 */
export async function getDoctorIncome(
  doctorId: string,
  period?: 'today' | 'week' | 'month' | 'year' | 'all'
): Promise<DoctorIncome> {
  const query = period ? `?period=${period}` : '';
  return authenticatedRequest<DoctorIncome>(`/doctors/${doctorId}/income${query}`);
}

// ============= DOCTOR PATIENTS API =============

/**
 * Get my patients statistics
 */
export async function getMyPatients(): Promise<DoctorPatients> {
  const doctorId = await getMyDoctorId();
  return authenticatedRequest<DoctorPatients>(`/doctors/${doctorId}/patients`);
}

/**
 * Get doctor patients by ID
 */
export async function getDoctorPatients(doctorId: string): Promise<DoctorPatients> {
  return authenticatedRequest<DoctorPatients>(`/doctors/${doctorId}/patients`);
}

// ============= DOCTOR APPOINTMENTS API =============

/**
 * Get my upcoming appointments
 */
export async function getMyAppointments(limit?: number): Promise<DoctorAppointments> {
  const doctorId = await getMyDoctorId();
  const query = limit ? `?limit=${limit}` : '';
  return authenticatedRequest<DoctorAppointments>(`/doctors/${doctorId}/appointments/upcoming${query}`);
}

/**
 * Get doctor upcoming appointments by ID
 */
export async function getDoctorAppointments(
  doctorId: string,
  limit?: number
): Promise<DoctorAppointments> {
  const query = limit ? `?limit=${limit}` : '';
  return authenticatedRequest<DoctorAppointments>(`/doctors/${doctorId}/appointments/upcoming${query}`);
}

// ============= DOCTOR SCHEDULE API =============

/**
 * Get doctor schedules
 */
export async function getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
  return authenticatedRequest<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`);
}

/**
 * Add schedules to doctor
 */
export async function addDoctorSchedules(
  doctorId: string,
  schedules: Omit<DoctorSchedule, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>[]
): Promise<{ message: string; doctor: Doctor }> {
  return authenticatedRequest<{ message: string; doctor: Doctor }>(`/doctors/${doctorId}/schedules`, {
    method: 'POST',
    body: JSON.stringify({ schedules }),
  });
}

/**
 * Update schedule
 */
export async function updateDoctorSchedule(
  scheduleId: string,
  data: Partial<DoctorSchedule>
): Promise<DoctorSchedule> {
  return authenticatedRequest<DoctorSchedule>(`/doctors/schedules/${scheduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete schedule
 */
export async function deleteDoctorSchedule(scheduleId: string): Promise<void> {
  return authenticatedRequest<void>(`/doctors/schedules/${scheduleId}`, {
    method: 'DELETE',
  });
}

// ============= BOOKING API FOR DOCTOR =============

/**
 * Get all doctor's bookings
 * Note: Backend endpoint /bookings/doctor-bookings requires doctorId in JWT which is not available.
 * This function uses alternative approach by getting appointments from doctors service.
 */
export async function getDoctorBookings(params?: {
  status?: string;
  date?: string;
}): Promise<Booking[]> {
  try {
    const doctorId = await getMyDoctorId();
    
    // Get appointments from doctors service (returns upcoming appointments)
    const appointments = await authenticatedRequest<DoctorAppointments>(
      `/doctors/${doctorId}/appointments/upcoming?limit=100`
    );
    
    // Transform appointments to Booking format
    const bookings: Booking[] = appointments.appointments.map((apt) => ({
      id: apt.id,
      user_id: apt.patient?.id || '',
      doctor_id: doctorId,
      schedule_id: '',
      booking_date: typeof apt.date === 'string' ? apt.date : new Date(apt.date).toISOString(),
      start_time: apt.start_time,
      end_time: apt.end_time,
      duration_minutes: apt.duration_minutes,
      consultation_type: apt.consultation_type,
      consultation_fee: apt.consultation_fee,
      status: apt.status as Booking['status'],
      payment_status: 'PAID' as Booking['payment_status'],
      notes: apt.notes,
      user: apt.patient ? {
        id: apt.patient.id,
        full_name: apt.patient.full_name,
        email: apt.patient.email || '',
        phone_number: apt.patient.phone_number,
        gender: apt.patient.gender,
        date_of_birth: apt.patient.date_of_birth,
      } : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    // Filter by status if provided
    let filtered = bookings;
    if (params?.status) {
      filtered = bookings.filter(b => b.status === params.status);
    }
    
    // Filter by date if provided
    if (params?.date) {
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.booking_date).toISOString().split('T')[0];
        return bookingDate === params.date;
      });
    }
    
    return filtered;
  } catch (error) {
    console.error('Error fetching doctor bookings:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  return authenticatedRequest<Booking>(`/bookings/${id}`);
}

/**
 * Confirm booking
 */
export async function confirmBooking(id: string): Promise<Booking> {
  return authenticatedRequest<Booking>(`/bookings/${id}/confirm`, {
    method: 'PATCH',
  });
}

/**
 * Complete booking
 */
export async function completeBooking(id: string): Promise<Booking> {
  return authenticatedRequest<Booking>(`/bookings/${id}/complete`, {
    method: 'PATCH',
  });
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  id: string,
  cancellationReason: string
): Promise<{ message: string; booking: Booking }> {
  return authenticatedRequest<{ message: string; booking: Booking }>(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancellation_reason: cancellationReason }),
  });
}

// ============= CHAT API =============

/**
 * Get all chat rooms for current user
 */
export async function getChatRooms(): Promise<ChatRoom[]> {
  return authenticatedRequest<ChatRoom[]>('/chat/rooms');
}

/**
 * Get or create chat room with patient
 */
export async function getOrCreateChatRoom(
  doctorId: string,
  bookingId?: string
): Promise<{ message: string; room: ChatRoom }> {
  return authenticatedRequest<{ message: string; room: ChatRoom }>('/chat/room', {
    method: 'POST',
    body: JSON.stringify({ doctorId, bookingId }),
  });
}

/**
 * Get chat room by ID
 */
export async function getChatRoom(roomId: string): Promise<ChatRoom> {
  return authenticatedRequest<ChatRoom>(`/chat/room/${roomId}`);
}

/**
 * Get messages in a chat room
 */
export async function getChatMessages(
  roomId: string,
  page?: number,
  limit?: number
): Promise<ChatMessagesResponse> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return authenticatedRequest<ChatMessagesResponse>(`/chat/room/${roomId}/messages${query}`);
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(roomId: string): Promise<{ success: boolean }> {
  return authenticatedRequest<{ success: boolean }>(`/chat/room/${roomId}/read`, {
    method: 'POST',
  });
}

/**
 * Send a message in a chat room
 */
export async function sendChatMessage(
  roomId: string,
  message: string,
  messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
): Promise<ChatMessage> {
  return authenticatedRequest<ChatMessage>(`/chat/room/${roomId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message, messageType }),
  });
}

/**
 * Get chat room by booking ID
 */
export async function getChatRoomByBooking(
  bookingId: string
): Promise<{ message?: string; room: ChatRoom | null }> {
  return authenticatedRequest<{ message?: string; room: ChatRoom | null }>(`/chat/booking/${bookingId}`);
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}.${minutes}`;
  };
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
 * Get booking status label in Indonesian
 */
export function getBookingStatusLabel(status: string): string {
  const statuses: Record<string, string> = {
    PENDING_PAYMENT: 'Menunggu Pembayaran',
    PENDING: 'Menunggu Konfirmasi',
    CONFIRMED: 'Dikonfirmasi',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    EXPIRED: 'Kedaluwarsa',
  };
  return statuses[status] || status;
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
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

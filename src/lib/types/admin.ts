// Admin Types & Interfaces

// ============= USER TYPES =============
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'DOCTOR' | 'ADMIN';
  phone_number?: string;
  whatsapp_number?: string;
  is_verified: boolean;
  email_verified_at?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE';
  weight_kg?: number;
  height_cm?: number;
  profile_picture_url?: string;
  diabetes_type?: 'TYPE_1' | 'TYPE_2' | 'GESTATIONAL' | 'PREDIABETES';
  is_on_insulin?: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

// ============= DOCTOR TYPES =============
export interface DayOfWeek {
  MONDAY: 'MONDAY';
  TUESDAY: 'TUESDAY';
  WEDNESDAY: 'WEDNESDAY';
  THURSDAY: 'THURSDAY';
  FRIDAY: 'FRIDAY';
  SATURDAY: 'SATURDAY';
  SUNDAY: 'SUNDAY';
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: keyof DayOfWeek;
  time_slot: string;
  duration_minutes: number;
  is_active: boolean;
  is_booked: boolean;
}

export interface AdminDoctor {
  id: string;
  user_id: string;
  specialization: string;
  alamat_praktek: string;
  price_range: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    profile_picture_url?: string;
  };
  schedules?: DoctorSchedule[];
}

export interface DoctorsResponse {
  success: boolean;
  data: AdminDoctor[];
  message?: string;
}

export interface CreateDoctorRequest {
  user_id: string;
  specialization: string;
  alamat_praktek: string;
  price_range: string;
  is_available?: boolean;
  schedules?: {
    day_of_week: keyof DayOfWeek;
    time_slot: string;
    duration_minutes: number;
    is_active: boolean;
  }[];
}

// ============= PRODUCT TYPES =============
export type ProductCategory = 
  | 'GLUCOSE_METER'
  | 'TEST_STRIPS'
  | 'INSULIN_SUPPLIES'
  | 'SUPPLEMENTS'
  | 'FOOD'
  | 'OTHER';

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percent: number;
  final_price: number;
  rating: number;
  rating_count: number;
  quantity: number;
  in_stock: boolean;
  category: ProductCategory;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  reviews?: Array<{
    id: string;
    rating: number;
    review_text?: string;
    created_at: string;
  }>;
}

export interface ProductsResponse {
  data: AdminProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  discount_percent?: number;
  quantity: number;
  category: ProductCategory;
  image_url?: string;
  is_active?: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

// ============= FACILITY TYPES =============
export type FacilityType = 
  | 'HOSPITAL'
  | 'CLINIC'
  | 'PUSKESMAS'
  | 'PHARMACY'
  | 'LAB'
  | 'OTHER';

export interface AdminFacility {
  id: string;
  name: string;
  type: FacilityType;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilitiesResponse {
  success: boolean;
  data: AdminFacility[];
  total?: number;
}

export interface CreateFacilityRequest {
  name: string;
  type: FacilityType;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

// ============= BOOKING/PAYMENT TYPES =============
export type BookingStatus = 
  | 'PENDING_PAYMENT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface AdminBooking {
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
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  doctor: {
    id: string;
    user: {
      full_name: string;
    };
    specialization: string;
  };
  payment?: AdminPayment;
}

export interface AdminPayment {
  id: string;
  booking_id: string;
  order_id: string;
  amount: number;
  payment_type?: string;
  transaction_id?: string;
  transaction_status?: string;
  transaction_time?: string;
  va_number?: string;
  bank?: string;
  expiry_time?: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  shipping_cost: number;
  grand_total: number;
  status: OrderStatus;
  shipping_status?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url?: string;
    };
  }[];
  payment?: {
    id: string;
    status: string;
    payment_type?: string;
  };
}

export interface BookingsResponse {
  success: boolean;
  data: AdminBooking[];
  total?: number;
}

export interface OrdersResponse {
  success: boolean;
  data: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

// ============= DASHBOARD STATS TYPES =============
export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalProducts: number;
  totalFacilities: number;
  totalBookings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingBookings: number;
  pendingOrders: number;
  recentBookings: AdminBooking[];
  recentOrders: AdminOrder[];
}

// ============= GENERIC API RESPONSE =============
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

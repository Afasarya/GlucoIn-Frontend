// Admin API Service
import { buildUrl } from './config';
import { storage } from '../hooks/useAuth';
import type {
  AdminUser,
  UsersResponse,
  AdminDoctor,
  DoctorsResponse,
  CreateDoctorRequest,
  AdminProduct,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  AdminFacility,
  FacilitiesResponse,
  CreateFacilityRequest,
  AdminBooking,
  BookingsResponse,
  AdminOrder,
  OrdersResponse,
  DashboardStats,
  ApiResponse,
} from '../types/admin';

// Helper function for authenticated API calls
async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = storage.getToken();
  const url = buildUrl(endpoint);
  
  if (!token) {
    console.warn(`No auth token found for request to ${endpoint}`);
  }
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}] ${endpoint}:`, data);
      throw {
        success: false,
        message: data.message || 'Terjadi kesalahan',
        statusCode: response.status,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error for ${endpoint}:`, error);
      throw {
        success: false,
        message: 'Tidak dapat terhubung ke server',
        statusCode: 0,
        error: 'NETWORK_ERROR',
      };
    }
    throw error;
  }
}

// Helper function for public API calls (no auth required)
async function publicRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}] ${endpoint}:`, data);
      throw {
        success: false,
        message: data.message || 'Terjadi kesalahan',
        statusCode: response.status,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error for ${endpoint}:`, error);
      throw {
        success: false,
        message: 'Tidak dapat terhubung ke server',
        statusCode: 0,
        error: 'NETWORK_ERROR',
      };
    }
    throw error;
  }
}

// ============= USER MANAGEMENT =============

export async function getAllUsers(params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.append('role', params.role);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  return authRequest<UsersResponse>(`/admin/users${query ? `?${query}` : ''}`);
}

export async function getUserById(id: string): Promise<ApiResponse<AdminUser>> {
  return authRequest<ApiResponse<AdminUser>>(`/admin/users/${id}`);
}

export async function updateUser(id: string, data: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
  return authRequest<ApiResponse<AdminUser>>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  return authRequest<ApiResponse<void>>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

// ============= DOCTOR MANAGEMENT =============

export async function getAllDoctors(params?: {
  specialization?: string;
  isAvailable?: boolean;
}): Promise<DoctorsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.specialization) searchParams.append('specialization', params.specialization);
  if (params?.isAvailable !== undefined) searchParams.append('isAvailable', params.isAvailable.toString());
  
  const query = searchParams.toString();
  // Backend returns array directly, wrap it in expected format
  const doctors = await authRequest<AdminDoctor[]>(`/doctors${query ? `?${query}` : ''}`);
  return {
    success: true,
    data: Array.isArray(doctors) ? doctors : [],
  };
}

export async function getDoctorById(id: string): Promise<ApiResponse<AdminDoctor>> {
  return authRequest<ApiResponse<AdminDoctor>>(`/doctors/${id}`);
}

export async function createDoctor(data: CreateDoctorRequest): Promise<ApiResponse<AdminDoctor>> {
  return authRequest<ApiResponse<AdminDoctor>>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorRequest>): Promise<ApiResponse<AdminDoctor>> {
  return authRequest<ApiResponse<AdminDoctor>>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(id: string): Promise<ApiResponse<void>> {
  return authRequest<ApiResponse<void>>(`/doctors/${id}`, {
    method: 'DELETE',
  });
}

export async function updateDoctorAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<AdminDoctor>> {
  return authRequest<ApiResponse<AdminDoctor>>(`/doctors/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ is_available: isAvailable }),
  });
}

// ============= PRODUCT MANAGEMENT =============

export async function getAllProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
  if (params?.inStock !== undefined) searchParams.append('inStock', params.inStock.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  // Public endpoint - no auth required
  return publicRequest<ProductsResponse>(`/marketplace/products${query ? `?${query}` : ''}`);
}

export async function getProductById(id: string): Promise<ApiResponse<AdminProduct>> {
  return authRequest<ApiResponse<AdminProduct>>(`/marketplace/products/${id}`);
}

export async function createProduct(data: CreateProductRequest): Promise<ApiResponse<AdminProduct>> {
  return authRequest<ApiResponse<AdminProduct>>('/marketplace/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<AdminProduct>> {
  return authRequest<ApiResponse<AdminProduct>>(`/marketplace/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  return authRequest<ApiResponse<void>>(`/marketplace/products/${id}`, {
    method: 'DELETE',
  });
}

// ============= FACILITY MANAGEMENT =============

export async function getAllFacilities(type?: string): Promise<FacilitiesResponse> {
  const query = type ? `?type=${type}` : '';
  // Public endpoint - Backend returns array directly, wrap it in expected format
  const facilities = await publicRequest<AdminFacility[]>(`/facilities${query}`);
  return {
    success: true,
    data: Array.isArray(facilities) ? facilities : [],
  };
}

export async function getFacilityById(id: string): Promise<ApiResponse<AdminFacility>> {
  return authRequest<ApiResponse<AdminFacility>>(`/facilities/${id}`);
}

export async function createFacility(data: CreateFacilityRequest): Promise<ApiResponse<AdminFacility>> {
  return authRequest<ApiResponse<AdminFacility>>('/facilities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFacility(id: string, data: Partial<CreateFacilityRequest>): Promise<ApiResponse<AdminFacility>> {
  return authRequest<ApiResponse<AdminFacility>>(`/facilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFacility(id: string): Promise<ApiResponse<void>> {
  return authRequest<ApiResponse<void>>(`/facilities/${id}`, {
    method: 'DELETE',
  });
}

// ============= BOOKING MANAGEMENT =============

export async function getAllBookings(params?: {
  status?: string;
  doctor_id?: string;
  date?: string;
}): Promise<BookingsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.doctor_id) searchParams.append('doctor_id', params.doctor_id);
  if (params?.date) searchParams.append('date', params.date);
  
  const query = searchParams.toString();
  // Backend returns array directly, wrap it in expected format
  const bookings = await authRequest<AdminBooking[]>(`/bookings${query ? `?${query}` : ''}`);
  return {
    success: true,
    data: Array.isArray(bookings) ? bookings : [],
  };
}

export async function getBookingById(id: string): Promise<ApiResponse<AdminBooking>> {
  return authRequest<ApiResponse<AdminBooking>>(`/bookings/${id}`);
}

export async function updateBookingStatus(id: string, status: string): Promise<ApiResponse<AdminBooking>> {
  return authRequest<ApiResponse<AdminBooking>>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function confirmBooking(id: string): Promise<ApiResponse<AdminBooking>> {
  return authRequest<ApiResponse<AdminBooking>>(`/bookings/${id}/confirm`, {
    method: 'PATCH',
  });
}

export async function completeBooking(id: string): Promise<ApiResponse<AdminBooking>> {
  return authRequest<ApiResponse<AdminBooking>>(`/bookings/${id}/complete`, {
    method: 'PATCH',
  });
}

export async function cancelBooking(id: string, reason?: string): Promise<ApiResponse<AdminBooking>> {
  return authRequest<ApiResponse<AdminBooking>>(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancellation_reason: reason }),
  });
}

// ============= ORDER MANAGEMENT =============

export async function getAllOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  return authRequest<OrdersResponse>(`/admin/orders${query ? `?${query}` : ''}`);
}

export async function updateOrderShipping(id: string, data: {
  shipping_status: string;
  tracking_number?: string;
}): Promise<ApiResponse<AdminOrder>> {
  return authRequest<ApiResponse<AdminOrder>>(`/marketplace/orders/${id}/shipping`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============= DASHBOARD STATISTICS =============

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return authRequest<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
}

// Fallback: Combine multiple API calls for dashboard stats
export async function getDashboardStatsManual(): Promise<DashboardStats> {
  try {
    const [doctorsRes, productsRes, facilitiesRes, bookingsRes] = await Promise.all([
      getAllDoctors(),
      getAllProducts({ limit: 1000 }),
      getAllFacilities(),
      getAllBookings(),
    ]);

    const doctors = doctorsRes.data || [];
    const products = productsRes.data || [];
    const facilities = facilitiesRes.data || [];
    const bookings = bookingsRes.data || [];

    const pendingBookings = bookings.filter(b => 
      b.status === 'PENDING' || b.status === 'PENDING_PAYMENT'
    );

    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.consultation_fee), 0);

    return {
      totalUsers: 0, // Would need admin endpoint
      totalDoctors: doctors.length,
      totalProducts: products.length,
      totalFacilities: facilities.length,
      totalBookings: bookings.length,
      totalOrders: 0, // Would need admin endpoint
      totalRevenue,
      pendingBookings: pendingBookings.length,
      pendingOrders: 0,
      recentBookings: bookings.slice(0, 5),
      recentOrders: [],
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalDoctors: 0,
      totalProducts: 0,
      totalFacilities: 0,
      totalBookings: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      pendingOrders: 0,
      recentBookings: [],
      recentOrders: [],
    };
  }
}

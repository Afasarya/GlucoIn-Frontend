// Auth API Service
import { API_CONFIG, buildUrl } from './config';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  RegisterResponse,
  VerifyOtpResponse,
} from '../types/auth';

// Helper function for API calls
async function apiRequest<T>(
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
      error: data.error,
    };
  }

  return data;
}

// Register new user
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Login user
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Verify OTP
export async function verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  return apiRequest<VerifyOtpResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Resend OTP
export async function resendOtp(data: ResendOtpRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Forgot Password - Request reset link
export async function forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Reset Password
export async function resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Get user profile (requires auth token)
export async function getProfile(token: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

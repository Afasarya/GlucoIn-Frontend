// Auth Types & Interfaces

// Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'USER' | 'DOCTOR' | 'ADMIN';
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
  confirmReset: boolean;
}

// Response Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'DOCTOR' | 'ADMIN';
  is_verified: boolean;
  phone_number?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    access_token?: string;
    user?: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    otp_sent: boolean;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
  error?: string;
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '../api/auth';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  User,
  ApiError,
} from '../types/auth';

// Token storage keys
const TOKEN_KEY = 'glucoin_token';
const USER_KEY = 'glucoin_user';

// Helper function to translate error messages to Indonesian
function translateError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid credentials': 'Email atau password salah',
    'Invalid OTP code': 'Kode OTP tidak valid',
    'OTP code has expired': 'Kode OTP sudah kadaluarsa',
    'User not found': 'Pengguna tidak ditemukan',
    'Email already exists': 'Email sudah terdaftar',
    'Email already verified': 'Email sudah terverifikasi',
    'Please verify your email before logging in': 'Silakan verifikasi email Anda terlebih dahulu',
    'Invalid or expired reset token': 'Token reset tidak valid atau sudah kadaluarsa',
    'Passwords do not match': 'Password tidak cocok',
    'Password must be at least 6 characters': 'Password minimal 6 karakter',
    'Network error': 'Terjadi kesalahan jaringan',
    'Internal server error': 'Terjadi kesalahan server',
  };
  
  // Check for exact match
  if (translations[message]) {
    return translations[message];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return message;
}

// Helper functions for localStorage
export const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Custom hook for authentication
export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Register
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      // Store email for OTP verification
      sessionStorage.setItem('pending_verification_email', data.email);
      router.push('/verify-otp');
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(translateError(apiError.message || 'Registrasi gagal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Login
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      // Backend returns { user, access_token } directly or { data: { user, access_token } }
      const accessToken = response.data?.access_token || (response as unknown as { access_token: string }).access_token;
      const user = response.data?.user || (response as unknown as { user: User }).user;
      
      if (accessToken && user) {
        storage.setToken(accessToken);
        storage.setUser(user);
        router.push('/dashboard');
      } else {
        throw { message: 'Login gagal, silakan coba lagi' };
      }
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Login gagal';
      
      // Check if user needs verification
      if (errorMessage.toLowerCase().includes('verify') || 
          errorMessage.toLowerCase().includes('verifikasi')) {
        sessionStorage.setItem('pending_verification_email', data.email);
        router.push('/verify-otp');
      }
      setError(translateError(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Verify OTP - returns success status for UI handling
  const verifyOtp = useCallback(async (data: VerifyOtpRequest): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyOtp(data);
      // Clear the pending email
      sessionStorage.removeItem('pending_verification_email');
      // Return success - let the component handle redirect
      return { success: true, message: 'Email berhasil diverifikasi! Mengalihkan ke halaman login...' };
    } catch (err) {
      const apiError = err as ApiError;
      setError(translateError(apiError.message || 'Verifikasi OTP gagal'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resend OTP
  const resendOtp = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resendOtp({ email });
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(translateError(apiError.message || 'Gagal mengirim ulang OTP'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.forgotPassword(data);
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(translateError(apiError.message || 'Gagal mengirim link reset password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    storage.clear();
    router.push('/login');
  }, [router]);

  return {
    isLoading,
    error,
    clearError,
    register,
    login,
    verifyOtp,
    resendOtp,
    forgotPassword,
    logout,
    getToken: storage.getToken,
    getUser: storage.getUser,
  };
}

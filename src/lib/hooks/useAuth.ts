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
      setError(apiError.message || 'Registrasi gagal');
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
      if (response.data?.access_token && response.data?.user) {
        storage.setToken(response.data.access_token);
        storage.setUser(response.data.user);
        router.push('/dashboard');
      }
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      // Check if user needs verification
      if (apiError.message?.toLowerCase().includes('verifikasi') || 
          apiError.message?.toLowerCase().includes('verify')) {
        sessionStorage.setItem('pending_verification_email', data.email);
        router.push('/verify-otp');
      }
      setError(apiError.message || 'Login gagal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Verify OTP
  const verifyOtp = useCallback(async (data: VerifyOtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOtp(data);
      if (response.data?.access_token && response.data?.user) {
        storage.setToken(response.data.access_token);
        storage.setUser(response.data.user);
        sessionStorage.removeItem('pending_verification_email');
        router.push('/dashboard');
      }
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Verifikasi OTP gagal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Resend OTP
  const resendOtp = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resendOtp({ email });
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Gagal mengirim ulang OTP');
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
      setError(apiError.message || 'Gagal mengirim link reset password');
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

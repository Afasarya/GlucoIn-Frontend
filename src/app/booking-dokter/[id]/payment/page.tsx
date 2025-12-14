"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { CreditCard, Clock, AlertCircle, CheckCircle, XCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../../components/common/Navbar";
import { getPaymentStatus, formatCurrency } from "@/lib/api/booking";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: Record<string, unknown>) => void;
          onPending: (result: Record<string, unknown>) => void;
          onError: (result: Record<string, unknown>) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface PaymentInfo {
  booking_id: string;
  snap_token: string;
  snap_redirect_url: string;
  order_id: string;
  amount: number;
  expiry_time: string;
  doctor_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
}

type PaymentStatus = 'waiting' | 'processing' | 'success' | 'failed' | 'expired';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('waiting');
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Load payment info from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('paymentInfo');
    if (storedData) {
      const data = JSON.parse(storedData) as PaymentInfo;
      // Use startTransition or setTimeout to avoid sync setState in effect
      setTimeout(() => setPaymentInfo(data), 0);
    } else {
      // No payment data, redirect back
      router.push(`/booking-dokter/${id}/confirm`);
    }
  }, [id, router]);

  // Countdown timer
  useEffect(() => {
    if (!paymentInfo?.expiry_time) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(paymentInfo.expiry_time).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown('Expired');
        setPaymentStatus('expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [paymentInfo?.expiry_time]);

  // Check payment status periodically
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentInfo?.order_id) return;
    
    try {
      const status = await getPaymentStatus(paymentInfo.order_id);
      
      // Check if payment object exists
      if (!status?.payment) {
        console.log('Payment status not available yet');
        return;
      }
      
      if (status.payment.status === 'PAID') {
        setPaymentStatus('success');
        // Clear payment info and redirect to success page
        sessionStorage.removeItem('paymentInfo');
        sessionStorage.setItem('bookingSuccess', JSON.stringify({
          booking_id: paymentInfo.booking_id,
          doctor_name: paymentInfo.doctor_name,
          booking_date: paymentInfo.booking_date,
          start_time: paymentInfo.start_time,
          end_time: paymentInfo.end_time,
          amount: paymentInfo.amount,
        }));
        setTimeout(() => {
          router.push(`/booking-dokter/${id}/success`);
        }, 2000);
      } else if (status.payment.status === 'FAILED') {
        setPaymentStatus('failed');
      } else if (status.payment.status === 'EXPIRED') {
        setPaymentStatus('expired');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  }, [paymentInfo, id, router]);

  // Poll payment status
  useEffect(() => {
    if (paymentStatus === 'processing') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [paymentStatus, checkPaymentStatus]);

  // Handle Snap payment
  const handlePayWithSnap = () => {
    if (!paymentInfo?.snap_token || !window.snap) return;
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    window.snap.pay(paymentInfo.snap_token, {
      onSuccess: (result) => {
        console.log('Payment success:', result);
        setPaymentStatus('success');
        // Clear payment info and redirect to success page
        sessionStorage.removeItem('paymentInfo');
        sessionStorage.setItem('bookingSuccess', JSON.stringify({
          booking_id: paymentInfo.booking_id,
          doctor_name: paymentInfo.doctor_name,
          booking_date: paymentInfo.booking_date,
          start_time: paymentInfo.start_time,
          end_time: paymentInfo.end_time,
          amount: paymentInfo.amount,
        }));
        router.push(`/booking-dokter/${id}/success`);
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        setPaymentStatus('processing');
        setIsProcessing(false);
      },
      onError: (result) => {
        console.error('Payment error:', result);
        setPaymentStatus('failed');
        setIsProcessing(false);
        setError('Pembayaran gagal. Silakan coba lagi.');
      },
      onClose: () => {
        console.log('Payment popup closed');
        setIsProcessing(false);
        // Check if payment was completed
        checkPaymentStatus();
      },
    });
  };

  // Handle redirect to Midtrans
  const handleRedirectPayment = () => {
    if (!paymentInfo?.snap_redirect_url) return;
    setPaymentStatus('processing');
    window.open(paymentInfo.snap_redirect_url, '_blank');
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <div className="bg-white">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D7CF3] border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Midtrans Snap Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
        onLoad={() => setIsSnapReady(true)}
      />

      {/* Navbar with white background */}
      <div className="bg-white">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Back button */}
        {paymentStatus === 'waiting' && (
          <Link href={`/booking-dokter/${id}/confirm`}>
            <motion.button
              whileHover={{ x: -4 }}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#1D7CF3]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Kembali ke Konfirmasi</span>
            </motion.button>
          </Link>
        )}

        <div className="mx-auto max-w-lg">
          {/* Payment Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF8FF]">
                {paymentStatus === 'success' ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : paymentStatus === 'failed' || paymentStatus === 'expired' ? (
                  <XCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <CreditCard className="h-8 w-8 text-[#1D7CF3]" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                {paymentStatus === 'success' 
                  ? 'Pembayaran Berhasil!'
                  : paymentStatus === 'failed'
                  ? 'Pembayaran Gagal'
                  : paymentStatus === 'expired'
                  ? 'Pembayaran Expired'
                  : paymentStatus === 'processing'
                  ? 'Menunggu Pembayaran'
                  : 'Pembayaran Booking'
                }
              </h1>
              {paymentStatus === 'waiting' && (
                <p className="mt-2 text-gray-500">
                  Selesaikan pembayaran untuk mengkonfirmasi booking Anda
                </p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            {/* Booking Summary */}
            <div className="mb-6 space-y-4 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Dokter</span>
                <span className="font-semibold text-gray-800">
                  {paymentInfo.doctor_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {new Date(paymentInfo.booking_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Waktu</span>
                <span className="font-semibold text-gray-800">
                  {paymentInfo.start_time.replace(':', '.')} - {paymentInfo.end_time.replace(':', '.')}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Total Pembayaran</span>
                <span className="text-xl font-bold text-[#1D7CF3]">
                  {formatCurrency(paymentInfo.amount)}
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            {(paymentStatus === 'waiting' || paymentStatus === 'processing') && countdown && countdown !== 'Expired' && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-700">
                  Selesaikan pembayaran dalam <span className="font-bold">{countdown}</span>
                </span>
              </div>
            )}

            {/* Payment Actions */}
            {paymentStatus === 'waiting' && (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayWithSnap}
                  disabled={!isSnapReady || isProcessing}
                  className={`w-full rounded-full py-3.5 text-base font-semibold transition-colors ${
                    isSnapReady && !isProcessing
                      ? "bg-[#1D7CF3] text-white hover:bg-[#1565D8]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {!isSnapReady ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Memuat...
                    </span>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRedirectPayment}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#1D7CF3] py-3.5 text-base font-semibold text-[#1D7CF3] transition-colors hover:bg-[#EEF8FF]"
                >
                  <ExternalLink className="h-5 w-5" />
                  Buka Halaman Pembayaran
                </motion.button>
              </div>
            )}

            {/* Processing Status */}
            {paymentStatus === 'processing' && (
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1D7CF3] border-t-transparent" />
                <p className="text-gray-600">
                  Menunggu konfirmasi pembayaran...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Jangan tutup halaman ini
                </p>
              </div>
            )}

            {/* Success Status */}
            {paymentStatus === 'success' && (
              <div className="text-center">
                <p className="text-gray-600">
                  Booking Anda telah dikonfirmasi. Mengalihkan ke halaman sukses...
                </p>
              </div>
            )}

            {/* Failed/Expired Status */}
            {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
              <div className="space-y-3">
                <p className="text-center text-gray-600">
                  {paymentStatus === 'expired' 
                    ? 'Waktu pembayaran telah habis.'
                    : 'Terjadi kesalahan saat memproses pembayaran.'
                  }
                </p>
                <Link href={`/booking-dokter/${id}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full bg-[#1D7CF3] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1565D8]"
                  >
                    Buat Booking Baru
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Order ID */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Order ID: {paymentInfo.order_id}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

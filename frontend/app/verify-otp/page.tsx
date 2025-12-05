'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';
import { parseAPIError } from '@/lib/utils';
import { ENV } from '@/lib/constants';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const phone = searchParams.get('phone') || '';
  const purpose = searchParams.get('purpose') || 'login';
  const role = searchParams.get('role') || '';
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For login: use login API with phone + OTP
      // For registration: use verifyOTP API
      let response;
      
      if (purpose === 'login') {
        response = await authAPI.login({
          phone_number: phone,
          otp: otpValue,
        });
      } else {
        response = await authAPI.verifyOTP({
          phone_number: phone,
          otp: otpValue,
          purpose: purpose as any,
        });
      }
      
      if (response.status === 'success' && response.data) {
        // Extract tokens - backend may return in different formats
        const tokens = response.data.tokens || response.data;
        const accessToken = tokens.access || response.data.access;
        const refreshToken = tokens.refresh || response.data.refresh;
        const user = response.data.user;
        
        if (user && accessToken && refreshToken) {
          setAuth(user, accessToken, refreshToken);
          toast.success(purpose === 'login' ? 'Login successful!' : 'Account verified successfully!');
          
          // Redirect based on role
          const userRole = user.role;
          if (userRole === 'fpo') {
            router.push('/fpo/dashboard');
          } else if (userRole === 'processor') {
            router.push('/processor/dashboard');
          } else if (userRole === 'government') {
            router.push('/government/dashboard');
          } else if (userRole === 'retailer') {
            router.push('/retailer/dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          toast.error('Invalid response format');
        }
      } else {
        toast.error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      toast.error(parseAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      if (purpose === 'login') {
        await authAPI.sendLoginOTP(phone);
      } else {
        await authAPI.sendOTP({ phone_number: phone, purpose: purpose as any });
      }
      toast.success('OTP sent successfully!');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      toast.error(parseAPIError(error));
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium text-gray-900">+91 {phone}</span>
          </p>
          {purpose === 'registration' && role && (
            <p className="mt-2 text-xs text-gray-500">
              Registering as: <span className="font-medium text-primary">{role.toUpperCase()}</span>
            </p>
          )}
        </div>
        
        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
            ))}
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Verify & Continue
          </Button>
          
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-medium text-primary">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}

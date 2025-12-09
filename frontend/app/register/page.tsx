'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { authAPI } from '@/lib/api';
import { parseAPIError } from '@/lib/utils';
import { ENV, USER_ROLES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_number: '',
    full_name: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const roleOptions = [
    { value: '', label: 'Select your role' },
    { value: USER_ROLES.FPO, label: 'FPO (Farmer Producer Organization)' },
    { value: USER_ROLES.PROCESSOR, label: 'Processor/Miller' },
    { value: USER_ROLES.RETAILER, label: 'Retailer/Buyer' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validations
    if (!formData.phone_number.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    if (formData.phone_number.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    
    // Validate phone number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      toast.error('Phone number must start with 6, 7, 8, or 9');
      return;
    }

    if (!formData.role) {
      toast.error('Please select your role');
      return;
    }
    
    // Validate full name if provided
    if (formData.full_name.trim() && formData.full_name.trim().length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }
    
    if (formData.full_name.trim() && !/^[a-zA-Z\s]+$/.test(formData.full_name.trim())) {
      toast.error('Full name can only contain letters and spaces');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.register({
        phone_number: formData.phone_number,
        role: formData.role,
        full_name: formData.full_name || undefined,
      });
      
      if (response.status === 'success') {
        toast.success(response.message || 'Registration successful! OTP sent to your phone.');
        // Navigate to OTP verification page
        router.push(`/verify-otp?phone=${formData.phone_number}&purpose=registration&role=${formData.role}`);
      } else {
        // Handle error response from API
        const errorMessage = response.message || (response as any).error || 'Registration failed';
        toast.error(errorMessage, { duration: 5000 });
      }
    } catch (error: any) {
      // Handle detailed error messages from API
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for specific field errors
        if (errorData.phone_number) {
          errorMessage = Array.isArray(errorData.phone_number) 
            ? errorData.phone_number[0] 
            : errorData.phone_number;
        } else if (errorData.role) {
          errorMessage = Array.isArray(errorData.role) 
            ? errorData.role[0] 
            : errorData.role;
        } else if (errorData.full_name) {
          errorMessage = Array.isArray(errorData.full_name) 
            ? errorData.full_name[0] 
            : errorData.full_name;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{ENV.APP_NAME}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>
        
        {/* Register Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 left-10 flex items-center pl-1 pointer-events-none">
                  <span className="text-gray-500 font-medium">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  maxLength={10}
                  value={formData.phone_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone_number: value });
                  }}
                  className="w-full pl-20 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  autoComplete="tel"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Enter your 10-digit mobile number
              </p>
            </div>
            
            <Input
              label="Full Name (Optional)"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setFormData({ ...formData, full_name: value });
              }}
              maxLength={50}
            />
            
            <Select
              label="Role"
              required
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  OTP-based Registration
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You'll receive a 6-digit OTP on your mobile for verification. No password required!</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Continue with OTP'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

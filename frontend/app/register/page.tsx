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
    
    // Validate phone number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    if (!formData.role) {
      toast.error('Please select your role');
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
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(parseAPIError(error));
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
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-7 text-gray-500 font-medium">
                +91
              </div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                required
                maxLength={10}
                value={formData.phone_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone_number: value });
                }}
                className="pl-12"
                helperText="Enter your 10-digit mobile number"
              />
            </div>
            
            <Input
              label="Full Name (Optional)"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { parseAPIError } from '@/lib/utils';
import { ENV } from '@/lib/constants';
import { stateNameToCode } from '@/lib/utils/stateMapping';
import { Store, MapPin, Phone, Mail, Briefcase } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const BUSINESS_TYPES = [
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retail Store' },
  { value: 'online', label: 'Online Seller' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'trader', label: 'Trader' }
];

const PRODUCT_CATEGORIES = [
  'Edible Oils', 'Oil Cakes', 'Raw Oilseeds', 'Refined Oils', 
  'Cooking Oils', 'Industrial Oils', 'Organic Products'
];

export default function RetailerOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    // Business Details
    business_name: '',
    business_type: '',
    year_of_establishment: '',
    
    // Products & Operations
    product_categories: [] as string[],
    
    // Contact
    email: '',
    
    // Address
    business_address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const validateStep1 = () => {
    if (!formData.business_name.trim()) {
      toast.error('Business name is required');
      return false;
    }
    if (formData.business_name.trim().length < 3) {
      toast.error('Business name must be at least 3 characters');
      return false;
    }
    
    if (!formData.business_type) {
      toast.error('Business type is required');
      return false;
    }
    
    if (formData.year_of_establishment) {
      const year = parseInt(formData.year_of_establishment);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        toast.error(`Year must be between 1900 and ${currentYear}`);
        return false;
      }
    }
    
    if (formData.product_categories.length === 0) {
      toast.error('Please select at least one product category');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.business_address.trim()) {
      toast.error('Business address is required');
      return false;
    }
    if (formData.business_address.trim().length < 10) {
      toast.error('Business address must be at least 10 characters');
      return false;
    }
    
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      toast.error('City can only contain letters and spaces');
      return false;
    }
    
    if (!formData.district.trim()) {
      toast.error('District is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.district.trim())) {
      toast.error('District can only contain letters and spaces');
      return false;
    }
    
    if (!formData.state) {
      toast.error('State is required');
      return false;
    }
    
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (!/^[1-9]\d{5}$/.test(formData.pincode)) {
      toast.error('Pincode must be a valid 6-digit number');
      return false;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const fetchCoordinates = async () => {
    if (!formData.business_address || !formData.city || !formData.state) {
      toast.error('Please fill address details first');
      return;
    }
    
    setIsFetchingLocation(true);
    
    try {
      const address = `${formData.business_address}, ${formData.city}, ${formData.district}, ${formData.state}, ${formData.pincode || ''}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData({
          ...formData,
          latitude: parseFloat(data[0].lat).toFixed(6),
          longitude: parseFloat(data[0].lon).toFixed(6)
        });
        toast.success('Location coordinates fetched successfully!');
      } else {
        toast.error('Could not find coordinates for this address');
      }
    } catch (error) {
      toast.error('Failed to fetch coordinates');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem(ENV.TOKEN_KEY);
      
      const response = await fetch(`${ENV.API_URL}/retailers/profiles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          state: stateNameToCode(formData.state),
          year_of_establishment: formData.year_of_establishment ? parseInt(formData.year_of_establishment) : null,
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.success('Profile created successfully!');
        router.push('/retailer/dashboard');
      } else {
        toast.error(data.message || 'Failed to create profile');
      }
    } catch (error: any) {
      toast.error(parseAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Retailer Profile</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`flex-1 ${step !== 2 ? 'mr-2' : ''}`}
              >
                <div
                  className={`h-2 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Business Details</span>
            <span>Address & Contact</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Business Details</h2>
              
              <Input
                label="Business Name"
                required
                placeholder="Enter business name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                maxLength={200}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Business Type"
                  required
                  options={[
                    { value: '', label: 'Select business type' },
                    ...BUSINESS_TYPES
                  ]}
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                />
                
                <Input
                  label="Year of Establishment (Optional)"
                  type="number"
                  placeholder="2015"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year_of_establishment}
                  onChange={(e) => setFormData({ ...formData, year_of_establishment: e.target.value })}
                />
              </div>
              

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Categories <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(category)}
                        onChange={() => setFormData({
                          ...formData,
                          product_categories: toggleArrayItem(formData.product_categories, category)
                        })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              

            </div>
          )}

          {/* Step 2: Address & Contact */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Address & Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter complete business address"
                  value={formData.business_address}
                  onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  maxLength={500}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, city: value });
                  }}
                  maxLength={100}
                />
                
                <Input
                  label="District"
                  required
                  placeholder="Enter district"
                  value={formData.district}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, district: value });
                  }}
                  maxLength={100}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="State"
                  required
                  options={[
                    { value: '', label: 'Select state' },
                    ...INDIAN_STATES.map(state => ({ value: state, label: state }))
                  ]}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                
                <Input
                  label="Pincode"
                  type="tel"
                  required
                  placeholder="400001"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, pincode: value });
                  }}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Location Coordinates (Optional)
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={fetchCoordinates}
                    isLoading={isFetchingLocation}
                    className="text-xs"
                  >
                    {isFetchingLocation ? 'Fetching...' : 'Fetch from Address'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="0.000001"
                    placeholder="19.076090"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                  
                  <Input
                    label="Longitude"
                    type="number"
                    step="0.000001"
                    placeholder="72.877426"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Click "Fetch from Address" to automatically get coordinates
                </p>
              </div>
              
              <Input
                label="Email"
                type="email"
                required
                placeholder="retailer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                maxLength={254}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>
            )}
            
            {currentStep < 2 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="w-full sm:flex-1 order-1 sm:order-2"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full sm:flex-1 order-1 sm:order-2"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

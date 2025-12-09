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
import { Factory, MapPin, Phone, Mail, FileText, Briefcase } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function ProcessorOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    // Company Details (matches ProcessorProfile model)
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    
    // Address (matches ProcessorProfile model)
    address: '',
    city: '',
    state: '',
    
    // Processing Details (matches ProcessorProfile model)
    processing_capacity_quintals_per_day: '',
    
    // Location coordinates
    latitude: '',
    longitude: '',
  });

  const validateStep1 = () => {
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return false;
    }
    if (formData.company_name.trim().length < 3) {
      toast.error('Company name must be at least 3 characters');
      return false;
    }
    
    if (!formData.contact_person.trim()) {
      toast.error('Contact person name is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.contact_person.trim())) {
      toast.error('Contact person name can only contain letters and spaces');
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Phone number must be a valid 10-digit number starting with 6-9');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.processing_capacity_quintals_per_day) {
      toast.error('Processing capacity is required');
      return false;
    }
    if (parseFloat(formData.processing_capacity_quintals_per_day) <= 0) {
      toast.error('Processing capacity must be greater than 0');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address.trim()) {
      toast.error('Factory address is required');
      return false;
    }
    if (formData.address.trim().length < 10) {
      toast.error('Factory address must be at least 10 characters');
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
    
    if (!formData.state) {
      toast.error('State is required');
      return false;
    }
    
    return true;
  };

  const fetchCoordinates = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      toast.error('Please fill address details first');
      return;
    }
    
    setIsFetchingLocation(true);
    
    try {
      const stateName = INDIAN_STATES.find(s => s === formData.state) || formData.state;
      const address = `${formData.address}, ${formData.city}, ${stateName}, India`;
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
      
      // Prepare data matching ProcessorProfile model
      const profileData = {
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: stateNameToCode(formData.state),
        processing_capacity_quintals_per_day: parseFloat(formData.processing_capacity_quintals_per_day),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      console.log('Submitting profile data:', profileData);
      
      const response = await fetch(`${ENV.API_URL}/processors/profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.success('Profile created successfully!');
        router.push('/processor/dashboard');
      } else {
        toast.error(data.message || 'Failed to create profile');
      }
    } catch (error: any) {
      toast.error(parseAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Factory className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Processor Profile</h1>
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
            <span>Company Details</span>
            <span>Address & Contact</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Company & Processing Details</h2>
              
              <Input
                label="Company Name"
                required
                placeholder="Enter company name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                maxLength={200}
              />
              
              <Input
                label="Contact Person Name"
                required
                placeholder="Enter contact person name"
                value={formData.contact_person}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormData({ ...formData, contact_person: value });
                }}
                maxLength={200}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <Input
                label="Processing Capacity (Quintals Per Day)"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="100.00"
                value={formData.processing_capacity_quintals_per_day}
                onChange={(e) => setFormData({ ...formData, processing_capacity_quintals_per_day: e.target.value })}
              />
              
            </div>
          )}

          {/* Step 2: Address & Contact */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factory Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Building Name Road Name Nagar Name"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  maxLength={500}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Example: ABC Industries Nehru Road Indira Nagar (without commas or pincode)
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="City"
                    required
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFormData({ ...formData, city: value });
                    }}
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter city name only
                  </p>
                </div>
                
                <div>
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
                  <p className="mt-1 text-xs text-gray-500">
                    Select your state
                  </p>
                </div>
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

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
import { Building2, MapPin, Phone, Mail, Users, Calendar, FileText } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const REGISTRATION_TYPES = [
  { value: 'fpo', label: 'Farmer Producer Organization' },
  { value: 'cooperative', label: 'Cooperative Society' },
  { value: 'shg', label: 'Self Help Group' },
  { value: 'company', label: 'Producer Company' }
];

const PRIMARY_CROPS = [
  'Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Safflower', 
  'Sesame', 'Linseed', 'Niger'
];

const SERVICES = [
  'Input Supply', 'Procurement', 'Processing', 'Storage', 
  'Marketing', 'Transportation', 'Training', 'Credit Facilitation'
];

export default function FPOOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    // Organization Details
    organization_name: '',
    registration_number: '',
    registration_type: '',
    year_of_registration: '',
    
    // Leadership
    contact_person_name: '',
    
    // Contact
    email: '',
    
    // Membership
    total_members: '',
    
    // Operational
    primary_crops: [] as string[],
    services_offered: [] as string[],
    
    // Address
    office_address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const validateStep1 = () => {
    if (!formData.organization_name.trim()) {
      toast.error('Organization name is required');
      return false;
    }
    if (formData.organization_name.trim().length < 3) {
      toast.error('Organization name must be at least 3 characters');
      return false;
    }
    
    if (!formData.registration_number.trim()) {
      toast.error('Registration number is required');
      return false;
    }
    if (!/^[A-Z0-9\-\/]+$/i.test(formData.registration_number)) {
      toast.error('Registration number can only contain letters, numbers, hyphens, and slashes');
      return false;
    }
    
    if (!formData.registration_type) {
      toast.error('Registration type is required');
      return false;
    }
    
    if (!formData.year_of_registration) {
      toast.error('Year of registration is required');
      return false;
    }
    const year = parseInt(formData.year_of_registration);
    const currentYear = new Date().getFullYear();
    if (year < 1950 || year > currentYear) {
      toast.error(`Year must be between 1950 and ${currentYear}`);
      return false;
    }
    
    if (!formData.contact_person_name.trim()) {
      toast.error('Contact person name is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.contact_person_name.trim())) {
      toast.error('Contact person name can only contain letters and spaces');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.office_address.trim()) {
      toast.error('Office address is required');
      return false;
    }
    if (formData.office_address.trim().length < 10) {
      toast.error('Office address must be at least 10 characters');
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

  const validateStep3 = () => {
    if (!formData.total_members || parseInt(formData.total_members) < 1) {
      toast.error('Total members must be at least 1');
      return false;
    }
    
    if (formData.primary_crops.length === 0) {
      toast.error('Please select at least one primary crop');
      return false;
    }
    
    if (formData.services_offered.length === 0) {
      toast.error('Please select at least one service offered');
      return false;
    }
    
    return true;
  };

  const fetchCoordinates = async () => {
    if (!formData.office_address || !formData.district || !formData.state) {
      toast.error('Please fill address details first');
      return;
    }
    
    setIsFetchingLocation(true);
    
    try {
      const address = `${formData.office_address}, ${formData.district}, ${formData.state}, ${formData.pincode || ''}`;
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
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < 3) {
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
    
    if (!validateStep3()) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem(ENV.TOKEN_KEY);
      
      const response = await fetch(`${ENV.API_URL}/fpos/profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          state: stateNameToCode(formData.state),
          total_members: parseInt(formData.total_members) || 0,
          year_of_registration: parseInt(formData.year_of_registration),
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        toast.success('Profile created successfully!');
        router.push('/fpo/dashboard');
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your FPO Profile</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Step {currentStep} of 3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 ${step !== 3 ? 'mr-2' : ''}`}
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
            <span>Organization Details</span>
            <span>Address & Contact</span>
            <span>Operations</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Step 1: Organization Details */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Organization Details</h2>
              
              <Input
                label="Organization Name"
                required
                placeholder="Enter FPO name"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                maxLength={200}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Registration Number"
                  required
                  placeholder="REG/2023/001"
                  value={formData.registration_number}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\-\/]/g, '');
                    setFormData({ ...formData, registration_number: value });
                  }}
                  maxLength={50}
                />
                
                <Select
                  label="Registration Type"
                  required
                  options={[
                    { value: '', label: 'Select type' },
                    ...REGISTRATION_TYPES
                  ]}
                  value={formData.registration_type}
                  onChange={(e) => setFormData({ ...formData, registration_type: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Year of Registration"
                  type="number"
                  required
                  placeholder="2023"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.year_of_registration}
                  onChange={(e) => setFormData({ ...formData, year_of_registration: e.target.value })}
                />
                
              </div>
              
              <Input
                label="Contact Person Name"
                required
                placeholder="Enter contact person name"
                value={formData.contact_person_name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setFormData({ ...formData, contact_person_name: value });
                }}
                maxLength={200}
              />
            </div>
          )}

          {/* Step 2: Address & Contact */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Address & Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter complete office address"
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  maxLength={500}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Village (Optional)"
                  placeholder="Enter village name"
                  value={formData.village}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, village: value });
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
                placeholder="fpo@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                maxLength={254}
              />
            </div>
          )}

          {/* Step 3: Operations & Membership */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Operations & Membership</h2>
              
              <Input
                label="Total Members"
                type="number"
                required
                min="1"
                placeholder="100"
                value={formData.total_members}
                onChange={(e) => setFormData({ ...formData, total_members: e.target.value })}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Crops <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRIMARY_CROPS.map((crop) => (
                    <label
                      key={crop}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.primary_crops.includes(crop)}
                        onChange={() => setFormData({
                          ...formData,
                          primary_crops: toggleArrayItem(formData.primary_crops, crop)
                        })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{crop}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICES.map((service) => (
                    <label
                      key={service}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.services_offered.includes(service)}
                        onChange={() => setFormData({
                          ...formData,
                          services_offered: toggleArrayItem(formData.services_offered, service)
                        })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
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
            
            {currentStep < 3 ? (
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

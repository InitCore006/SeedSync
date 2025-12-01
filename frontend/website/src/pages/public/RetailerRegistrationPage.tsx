import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { retailerService } from '../../services/retailer.service';
import { useAuthStore } from '../../store/authStore';
import { INDIAN_STATES } from '../../types';

interface Step1Data {
  phone_number: string;
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
  preferred_language: string;
}

interface Step2Data {
  date_of_birth: string;
  gender: string;
  address_line1: string;
  address_line2: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

interface Step3Data {
  business_name: string;
  retailer_type: string;
  city: string;  // This is in Retailer model!
  state: string;
  pincode: string;
  gstin: string;
  fssai_license: string;
  monthly_requirement: number;
  payment_terms: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

export const RetailerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationToken, setRegistrationToken] = useState<string>('');

  const [step1Data, setStep1Data] = useState<Step1Data>({
    phone_number: '',
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
    preferred_language: 'en',
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    date_of_birth: '',
    gender: '',
    address_line1: '',
    address_line2: '',
    village: '',
    block: '',
    district: '',
    state: '',
    pincode: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    business_name: '',
    retailer_type: 'wholesaler',
    city: '',  // User enters city in step 3
    state: '',
    pincode: '',
    gstin: '',
    fssai_license: '',
    monthly_requirement: 0,
    payment_terms: 'credit_15',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
  });

  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStep1Data(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStep2Data(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleStep3Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStep3Data(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!/^[6-9]\d{9}$/.test(step1Data.phone_number)) {
      newErrors.phone_number = 'Invalid phone number';
    }
    if (!step1Data.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (step1Data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1Data.email)) {
      newErrors.email = 'Invalid email';
    }
    if (step1Data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (step1Data.password !== step1Data.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!step2Data.district.trim()) newErrors.district = 'District is required';
    if (!step2Data.state) newErrors.state = 'State is required';
    if (!/^[1-9][0-9]{5}$/.test(step2Data.pincode)) {
      newErrors.pincode = 'Invalid pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!step3Data.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(step3Data.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }
    if (!step3Data.contact_person.trim()) {
      newErrors.contact_person = 'Contact person is required';
    }
    if (!/^[6-9]\d{9}$/.test(step3Data.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step3Data.contact_email)) {
      newErrors.contact_email = 'Invalid email';
    }
    if (step3Data.monthly_requirement <= 0) {
      newErrors.monthly_requirement = 'Requirement must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const response = await retailerService.registerStep1(step1Data);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        setRegistrationToken(response.data.registration_token);
        setCurrentStep(2);
      }
    } catch (error) {
      alert('Step 1 failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const dataWithToken = {
        ...step2Data,
        registration_token: registrationToken,
      };
      
      const response = await retailerService.registerStep2(dataWithToken);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        if (response.data.registration_token) {
          setRegistrationToken(response.data.registration_token);
        }
        // Pre-fill step 3
        setStep3Data(prev => ({
          ...prev,
          city: step2Data.city,
          state: step2Data.state,
          pincode: step2Data.pincode,
          contact_person: step1Data.full_name,
          contact_phone: step1Data.phone_number,
          contact_email: step1Data.email,
        }));
        setCurrentStep(3);
      }
    } catch (error) {
      alert('Step 2 failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      const dataWithToken = {
        ...step3Data,
        registration_token: registrationToken,
      };
      
      const response = await retailerService.registerStep3(dataWithToken);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        if (response.data.tokens) {
          setAuth(response.data.user, response.data.tokens.access);
        }
        alert('Retailer registered successfully! Awaiting verification.');
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium">Account</span>
              <span className="text-sm font-medium">Profile</span>
              <span className="text-sm font-medium">Business</span>
            </div>
          </div>

          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 1: Create Your Account
              </h2>

              <Input
                label="Phone Number"
                name="phone_number"
                value={step1Data.phone_number}
                onChange={handleStep1Change}
                error={errors.phone_number}
                required
                maxLength={10}
                placeholder="10-digit mobile number"
              />

              <Input
                label="Full Name"
                name="full_name"
                value={step1Data.full_name}
                onChange={handleStep1Change}
                error={errors.full_name}
                required
              />

              <Input
                label="Email (Optional)"
                name="email"
                type="email"
                value={step1Data.email}
                onChange={handleStep1Change}
                error={errors.email}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={step1Data.password}
                onChange={handleStep1Change}
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                name="password_confirm"
                type="password"
                value={step1Data.password_confirm}
                onChange={handleStep1Change}
                error={errors.password_confirm}
                required
              />

              <Select
                label="Preferred Language"
                name="preferred_language"
                value={step1Data.preferred_language}
                onChange={handleStep1Change}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'bn', label: 'Bengali' },
                ]}
              />

              <Button
                onClick={handleStep1Submit}
                isLoading={isLoading}
                className="w-full"
              >
                Next: Profile Details
              </Button>
            </div>
          )}

          {/* Step 2: Profile */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 2: Your Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={step2Data.date_of_birth}
                  onChange={handleStep2Change}
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={step2Data.gender}
                  onChange={handleStep2Change}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'M', label: 'Male' },
                    { value: 'F', label: 'Female' },
                    { value: 'O', label: 'Other' },
                  ]}
                />
              </div>

              <Input
                label="Address Line 1"
                name="address_line1"
                value={step2Data.address_line1}
                onChange={handleStep2Change}
              />

              <Input
                label="Address Line 2"
                name="address_line2"
                value={step2Data.address_line2}
                onChange={handleStep2Change}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                label="State"
                name="state"
                value={step2Data.state}
                onChange={handleStep2Change}
                error={errors.state}
                required
                options={[
                  { value: '', label: 'Select State' },
                  ...INDIAN_STATES.map(state => ({ value: state, label: state }))
                ]}
              />

              <Input
                label="District"
                name="district"
                value={step2Data.district}
                onChange={handleStep2Change}
                error={errors.district}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Village (Optional)"
                name="village"
                value={step2Data.village}
                onChange={handleStep2Change}
              />

              <Input
                label="Block (Optional)"
                name="block"
                value={step2Data.block}
                onChange={handleStep2Change}
              />
            </div>

            <Input
              label="Pincode"
              name="pincode"
              value={step2Data.pincode}
              onChange={handleStep2Change}
              error={errors.pincode}
              required
              maxLength={6}
            />

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStep2Submit}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Next: Business Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Business */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 3: Business Details
              </h2>

              <Input
                label="Business Name"
                name="business_name"
                value={step3Data.business_name}
                onChange={handleStep3Change}
                error={errors.business_name}
                required
              />

              <Select
                label="Retailer Type"
                name="retailer_type"
                value={step3Data.retailer_type}
                onChange={handleStep3Change}
                required
                options={[
                  { value: 'wholesaler', label: 'Wholesaler' },
                  { value: 'retail_chain', label: 'Retail Chain' },
                  { value: 'food_processor', label: 'Food Processor' },
                  { value: 'exporter', label: 'Exporter' },
                ]}
              />

              {/* Business Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Business Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={step3Data.city}
                    onChange={handleStep3Change}
                    error={errors.city}
                    required
                    placeholder="Business city"
                  />

                  <Select
                    label="State"
                    name="state"
                    value={step3Data.state}
                    onChange={handleStep3Change}
                    required
                    options={[
                      { value: '', label: 'Select State' },
                      ...INDIAN_STATES.map(state => ({ value: state, label: state }))
                    ]}
                  />
                </div>

                <Input
                  label="Pincode"
                  name="pincode"
                  value={step3Data.pincode}
                  onChange={handleStep3Change}
                  required
                  maxLength={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GSTIN"
                  name="gstin"
                  value={step3Data.gstin}
                  onChange={handleStep3Change}
                  error={errors.gstin}
                  required
                  maxLength={15}
                />

                <Input
                  label="FSSAI License (Optional)"
                  name="fssai_license"
                  value={step3Data.fssai_license}
                  onChange={handleStep3Change}
                  maxLength={14}
                />
              </div>

              <Input
                label="Contact Person"
                name="contact_person"
                value={step3Data.contact_person}
                onChange={handleStep3Change}
                error={errors.contact_person}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  name="contact_phone"
                  value={step3Data.contact_phone}
                  onChange={handleStep3Change}
                  error={errors.contact_phone}
                  required
                  maxLength={10}
                />

                <Input
                  label="Contact Email"
                  name="contact_email"
                  type="email"
                  value={step3Data.contact_email}
                  onChange={handleStep3Change}
                  error={errors.contact_email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Monthly Requirement (Quintals)"
                  name="monthly_requirement"
                  type="number"
                  step="0.01"
                  value={step3Data.monthly_requirement}
                  onChange={handleStep3Change}
                  error={errors.monthly_requirement}
                  required
                />

                <Select
                  label="Payment Terms"
                  name="payment_terms"
                  value={step3Data.payment_terms}
                  onChange={handleStep3Change}
                  required
                  options={[
                    { value: 'advance', label: 'Advance' },
                    { value: 'credit_15', label: '15 Days Credit' },
                    { value: 'credit_30', label: '30 Days Credit' },
                  ]}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStep3Submit}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Complete Registration
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
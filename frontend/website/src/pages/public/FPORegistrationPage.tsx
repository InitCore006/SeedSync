import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { fpoService } from '../../services/fpo.service';
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
  education_level: string;
}

interface Step3Data {
  name: string;
  registration_number: string;
  gstin: string;
  district: string;
  state: string;
  pincode: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  total_land_area: number;
  monthly_capacity: number;
}

export const FPORegistrationPage: React.FC = () => {
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
    education_level: '',
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    name: '',
    registration_number: '',
    gstin: '',
    district: '',
    state: '',
    pincode: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    total_land_area: 0,
    monthly_capacity: 0,
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

    if (!step3Data.name.trim()) newErrors.name = 'FPO name is required';
    if (!step3Data.registration_number.trim()) {
      newErrors.registration_number = 'Registration number is required';
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
    if (step3Data.total_land_area <= 0) {
      newErrors.total_land_area = 'Land area must be greater than 0';
    }
    if (step3Data.monthly_capacity <= 0) {
      newErrors.monthly_capacity = 'Capacity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const response = await fpoService.registerStep1(step1Data);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        // Store registration token
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
      // Include registration token
      const dataWithToken = {
        ...step2Data,
        registration_token: registrationToken,
      };
      
      const response = await fpoService.registerStep2(dataWithToken);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        // Update token if changed
        if (response.data.registration_token) {
          setRegistrationToken(response.data.registration_token);
        }
        // Pre-fill step 3 with profile data
        setStep3Data(prev => ({
          ...prev,
          district: step2Data.district,
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
      // Include registration token
      const dataWithToken = {
        ...step3Data,
        registration_token: registrationToken,
      };
      
      const response = await fpoService.registerStep3(dataWithToken);
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        // Set auth tokens
        if (response.data.tokens) {
          setAuth(response.data.user, response.data.tokens.access);
        }
        alert('FPO registered successfully! Awaiting verification.');
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
              <span className="text-sm font-medium">FPO Details</span>
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
                <Input
                  label="Village"
                  name="village"
                  value={step2Data.village}
                  onChange={handleStep2Change}
                />

                <Input
                  label="Block"
                  name="block"
                  value={step2Data.block}
                  onChange={handleStep2Change}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="State"
                  name="state"
                  value={step2Data.state}
                  onChange={handleStep2Change}
                  error={errors.state}
                  required
                  options={INDIAN_STATES.map(state => ({ value: state, label: state }))}
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
                  Next: FPO Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: FPO */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 3: FPO Details
              </h2>

              <Input
                label="FPO Name"
                name="name"
                value={step3Data.name}
                onChange={handleStep3Change}
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Registration Number"
                  name="registration_number"
                  value={step3Data.registration_number}
                  onChange={handleStep3Change}
                  error={errors.registration_number}
                  required
                />

                <Input
                  label="GSTIN (Optional)"
                  name="gstin"
                  value={step3Data.gstin}
                  onChange={handleStep3Change}
                  maxLength={15}
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
                  label="Total Land Area (Hectares)"
                  name="total_land_area"
                  type="number"
                  step="0.01"
                  value={step3Data.total_land_area}
                  onChange={handleStep3Change}
                  error={errors.total_land_area}
                  required
                />

                <Input
                  label="Monthly Capacity (Quintals)"
                  name="monthly_capacity"
                  type="number"
                  step="0.01"
                  value={step3Data.monthly_capacity}
                  onChange={handleStep3Change}
                  error={errors.monthly_capacity}
                  required
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
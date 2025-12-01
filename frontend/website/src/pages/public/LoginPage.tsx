import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        // Set auth in store
        setAuth(response.data.user, response.data.tokens.access);
        
        // Navigate based on role
        const role = response.data.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Login to your SeedSync account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              required
              maxLength={10}
              placeholder="10-digit mobile number"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Register as:</p>
            <div className="mt-2 flex gap-2 justify-center flex-wrap">
              <Link to="/register/fpo" className="text-sm text-blue-600 hover:underline">
                FPO
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/register/processor" className="text-sm text-blue-600 hover:underline">
                Processor
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/register/retailer" className="text-sm text-blue-600 hover:underline">
                Retailer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
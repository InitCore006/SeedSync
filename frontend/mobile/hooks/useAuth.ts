import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';

export const useAuth = () => {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadUser,
    updateUser,
    clearError,
  } = useAuthStore();

  const { clearFarmer } = useFarmerStore();

  // Load user on mount
  useEffect(() => {
    if (!user && !isLoading) {
      loadUser();
    }
  }, []);

  // Enhanced logout that clears all stores
  const handleLogout = async () => {
    await logout();
    clearFarmer();
  };

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
    loadUser,
    updateUser,
    clearError,
    
    // Role checks
    isFarmer: user?.role === 'farmer',
    isFPO: user?.role === 'fpo',
    isProcessor: user?.role === 'processor',
    isBuyer: user?.role === 'buyer',
    isAdmin: user?.role === 'admin',
    
    // Verification status
    isPhoneVerified: user?.is_phone_verified || false,
    isEmailVerified: user?.is_email_verified || false,
    isKYCVerified: user?.is_kyc_verified || false,
    isActive: user?.is_active || false,
  };
};
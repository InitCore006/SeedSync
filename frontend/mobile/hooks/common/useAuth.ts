import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadUser,
    clearError,
    updateUser,
  } = useAuthStore();

  const resetFarmerStore = useFarmerStore((state) => state.reset);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Enhanced logout that clears all stores
  const handleLogout = async () => {
    await logout();
    resetFarmerStore();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
    loadUser,
    clearError,
    updateUser,
    isFarmer: user?.role === 'FARMER',
    isWarehouse: user?.role === 'WAREHOUSE',
    isLogistics: user?.role === 'LOGISTICS',
    isApproved: user?.approval_status === 'APPROVED',
  };
};
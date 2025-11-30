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

  const resetFarmerStore = () => {
    // safe no-op if reset is not defined on farmer store
    const store = (useFarmerStore as unknown as { getState?: () => any }).getState
      ? (useFarmerStore as any).getState()
      : undefined;
    if (store && typeof store.reset === 'function') {
      store.reset();
    }
  };

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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';
import { profileService } from '@/services/profile.service';

export interface ProfileFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O' | '';
  
  // Address
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farm Details
  totalLandArea: string;
  irrigatedLand: string;
  rainfedLand: string;
  primarySoilType: string;
  irrigationMethod: string;
  
  // Profile Image
  profileImage?: string;
  
  // Verification Status
  isKycVerified: boolean;
  isPhoneVerified: boolean;
}

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const authProfile = useAuthStore((state) => state.profile);
  const fetchAuthProfile = useAuthStore((state) => state.fetchProfile);
  
  const farmer = useFarmerStore((state) => state.farmer);
  const loadFarmerProfile = useFarmerStore((state) => state.loadFarmerProfile);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the profile conversion to prevent unnecessary recalculations
  const profile: ProfileFormData | null = useMemo(() => {
    if (!user || !authProfile) return null;

    return {
      firstName: user.full_name?.split(' ')[0] || '',
      lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phoneNumber: user.phone_number || '',
      dateOfBirth: authProfile.profile.date_of_birth || '',
      gender: authProfile.profile.gender || '',
      address: authProfile.profile.address_line1 || '',
      village: authProfile.profile.village || '',
      district: authProfile.profile.district || '',
      state: authProfile.profile.state || '',
      pincode: authProfile.profile.pincode || '',
      totalLandArea: farmer?.total_land_area?.toString() || '',
      irrigatedLand: farmer?.irrigated_land?.toString() || '',
      rainfedLand: farmer?.rain_fed_land?.toString() || '',
      primarySoilType: farmer?.primary_soil_type || '',
      irrigationMethod: farmer?.irrigation_method || '',
      profileImage: authProfile.profile.profile_picture || undefined,
      isKycVerified: user.is_kyc_verified || false,
      isPhoneVerified: user.is_phone_verified || false,
    };
  }, [user, authProfile, farmer]);

  // Load profile data only once on mount
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;

    const loadProfile = async () => {
      // Only load if we don't have data and haven't loaded yet
      if (hasLoaded || (user && authProfile && farmer)) {
        console.log('✅ Profile data already available, skipping load');
        return;
      }

      hasLoaded = true;
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Loading profile data...');
        
        // Load both in parallel
        await Promise.all([
          fetchAuthProfile(),
          loadFarmerProfile(),
        ]);
        
        if (isMounted) {
          console.log('✅ Profile data loaded successfully');
        }
      } catch (error: any) {
        console.error('❌ Error loading profile:', error);
        if (isMounted) {
          setError(error.message || 'Failed to load profile');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []); // Empty array - only run once on mount

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Refreshing profile data...');
      await Promise.all([
        fetchAuthProfile(),
        loadFarmerProfile(),
      ]);
      console.log('✅ Profile data refreshed');
    } catch (error: any) {
      console.error('❌ Error refreshing profile:', error);
      setError(error.message || 'Failed to refresh profile');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAuthProfile, loadFarmerProfile]);

  const updateProfile = useCallback(async (data: Partial<ProfileFormData>) => {
    if (!profile) {
      throw new Error('Profile not loaded');
    }

    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('📝 Updating profile with data:', data);

      // Combine firstName and lastName into full_name
      let fullName: string | undefined;
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const firstName = data.firstName ?? profile.firstName;
        const lastName = data.lastName ?? profile.lastName;
        fullName = `${firstName} ${lastName}`.trim();
      }

      // Prepare combined update object for farmer endpoint
      const updateData: any = {};
      
      // User fields
      if (fullName) updateData.full_name = fullName;
      if (data.email !== undefined) updateData.email = data.email;
      
      // Profile fields
      if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.address !== undefined) updateData.address_line1 = data.address;
      if (data.village !== undefined) updateData.village = data.village;
      if (data.district !== undefined) updateData.district = data.district;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.pincode !== undefined) updateData.pincode = data.pincode;
      
      // Farmer fields
      if (data.totalLandArea !== undefined) {
        const landArea = parseFloat(data.totalLandArea);
        updateData.total_land_area = isNaN(landArea) ? 0 : landArea;
      }
      if (data.irrigatedLand !== undefined) {
        const irrigated = parseFloat(data.irrigatedLand);
        updateData.irrigated_land = isNaN(irrigated) ? 0 : irrigated;
      }
      if (data.rainfedLand !== undefined) {
        const rainfed = parseFloat(data.rainfedLand);
        updateData.rain_fed_land = isNaN(rainfed) ? 0 : rainfed;
      }
      if (data.primarySoilType !== undefined) {
        updateData.primary_soil_type = data.primarySoilType;
      }
      if (data.irrigationMethod !== undefined) {
        updateData.irrigation_method = data.irrigationMethod;
      }

      console.log('📤 Sending update data:', updateData);

      // Update via farmer endpoint (which updates user + profile + farmer)
      if (Object.keys(updateData).length > 0) {
        await profileService.updateFarmerProfile(updateData);
      }
      
      console.log('✅ Profile updated successfully');
      
      // Refresh data
      await refresh();
      
      return true;
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [profile, refresh]);

  const uploadProfileImage = useCallback(async (imageUri: string) => {
    try {
      console.log('📤 Uploading profile image...');
      await profileService.uploadProfileImage(imageUri);
      await fetchAuthProfile();
      console.log('✅ Profile image uploaded successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error uploading image:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to upload image';
      throw new Error(errorMessage);
    }
  }, [fetchAuthProfile]);

  return {
    profile,
    farmer,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    uploadProfileImage,
    refresh,
  };
}
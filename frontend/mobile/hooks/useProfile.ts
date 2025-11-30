import { useProfileStore } from '@/store/profileStore';

export const useProfile = () => {
  const {
    profile,
    bankDetails,
    documents,
    settings,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    fetchBankDetails,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setPrimaryAccount,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    fetchSettings,
    updateSettings,
    clearProfile,
  } = useProfileStore();

  // Helper functions
  const getKYCStatus = () => {
    if (!profile) return null;
    
    const requiredDocs = ['aadhaar', 'pan', 'bank_passbook'];
    const uploadedDocs = documents.filter((doc) => requiredDocs.includes(doc.type));
    const verifiedDocs = uploadedDocs.filter((doc) => doc.status === 'verified');
    
    return {
      isComplete: uploadedDocs.length === requiredDocs.length,
      isVerified: verifiedDocs.length === requiredDocs.length,
      progress: (uploadedDocs.length / requiredDocs.length) * 100,
      pending: requiredDocs.filter(
        (type) => !uploadedDocs.some((doc) => doc.type === type)
      ),
    };
  };

  const getPrimaryBankAccount = () => {
    return bankDetails.find((acc) => acc.isPrimary) || bankDetails[0] || null;
  };

  const getVerifiedBankAccounts = () => {
    return bankDetails.filter((acc) => acc.isVerified);
  };

  const getDocumentByType = (type: string) => {
    return documents.find((doc) => doc.type === type);
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.phoneNumber,
      profile.email,
      profile.address,
      profile.village,
      profile.district,
      profile.state,
      profile.pincode,
      profile.dateOfBirth,
      profile.gender,
    ];
    
    const filledFields = fields.filter((field) => field && field !== '').length;
    return (filledFields / fields.length) * 100;
  };

  return {
    // Data
    profile,
    bankDetails,
    documents,
    settings,
    
    // State
    isLoading,
    error,
    
    // Actions
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    fetchBankDetails,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setPrimaryAccount,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    fetchSettings,
    updateSettings,
    clearProfile,
    
    // Helper methods
    getKYCStatus,
    getPrimaryBankAccount,
    getVerifiedBankAccounts,
    getDocumentByType,
    getProfileCompleteness,
  };
};
// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: 'M' | 'F' | 'O' | null;
  profileImage: string | null;
  
  // Address
  addressLine1: string;
  addressLine2: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  
  // Verification
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  
  // Bank Details (from profile)
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  
  // Additional
  educationLevel: string;
  preferredLanguage: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  farmerId: string;
  userId: string;
  
  // Land Details
  totalLandArea: number;
  irrigatedLand: number;
  rainfedLand: number;
  
  // Categorization
  farmerCategory: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
  casteCategory: 'general' | 'obc' | 'sc' | 'st';
  
  // Farm Details
  primarySoilType: string;
  irrigationMethod: string;
  
  // Government Schemes
  hasKisanCreditCard: boolean;
  kccNumber: string;
  hasPmfbyInsurance: boolean;
  pmfbyPolicyNumber: string;
  hasPmKisan: boolean;
  
  // Documents
  aadharNumber: string;
  panNumber: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CompleteProfile {
  user: UserProfile;
  farmer: FarmerProfile | null;
}

// ============================================================================
// BANK DETAILS
// ============================================================================

export interface BankDetails {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  branch: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetailsFormData {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  branch?: string;
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export type DocumentType = 
  | 'aadhar'
  | 'pan'
  | 'land_ownership'
  | 'bank_passbook'
  | 'ration_card'
  | 'farmer_id'
  | 'other';

export interface Document {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNote: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
}

export interface DocumentUploadData {
  documentType: DocumentType;
  documentNumber?: string;
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

// ============================================================================
// APP SETTINGS
// ============================================================================

export interface AppSettings {
  userId: string;
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Notification Preferences
  notifyCropUpdates: boolean;
  notifyMarketPrices: boolean;
  notifyWeatherAlerts: boolean;
  notifyFpoAnnouncements: boolean;
  notifyGovernmentSchemes: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'private' | 'fpo_only';
  showPhoneNumber: boolean;
  showEmail: boolean;
  
  // App Preferences
  language: 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'mr';
  theme: 'light' | 'dark' | 'auto';
  currency: 'INR';
  measurementUnit: 'metric' | 'imperial';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  
  updatedAt: string;
}

// ============================================================================
// UPDATE REQUESTS
// ============================================================================

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F' | 'O';
  addressLine1?: string;
  addressLine2?: string;
  village?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  educationLevel?: string;
  preferredLanguage?: string;
}

export interface UpdateFarmerProfileRequest {
  totalLandArea?: number;
  irrigatedLand?: number;
  rainfedLand?: number;
  farmerCategory?: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
  casteCategory?: 'general' | 'obc' | 'sc' | 'st';
  primarySoilType?: string;
  irrigationMethod?: string;
  hasKisanCreditCard?: boolean;
  kccNumber?: string;
  hasPmfbyInsurance?: boolean;
  pmfbyPolicyNumber?: string;
  hasPmKisan?: boolean;
  aadharNumber?: string;
  panNumber?: string;
}

export interface UpdateBankDetailsRequest {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

// ============================================================================
// PROFILE COMPLETION
// ============================================================================

export interface ProfileCompletionStatus {
  overall: number;
  sections: {
    basicInfo: number;
    address: number;
    bankDetails: number;
    farmDetails: number;
    documents: number;
  };
  missingFields: string[];
}
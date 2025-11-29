// ============================================================================
// FARMER TYPES
// ============================================================================

export type FarmerCategory = 
  | 'small' 
  | 'marginal' 
  | 'medium' 
  | 'large';

export type FarmingType = 
  | 'organic' 
  | 'conventional' 
  | 'integrated' 
  | 'natural';

export type IrrigationType = 
  | 'canal' 
  | 'borewell' 
  | 'drip' 
  | 'sprinkler' 
  | 'rainfed';

export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'voter-id'
  | 'land-document'
  | 'bank-passbook'
  | 'kisan-card'
  | 'ration-card';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

// ============================================================================
// LOT TYPES (MARKETPLACE)
// ============================================================================

export type LotStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED';

export type CropCategory = 
  | 'cereals' 
  | 'pulses' 
  | 'vegetables' 
  | 'fruits' 
  | 'spices' 
  | 'oilseeds'
  | 'cash-crops';

export type QualityGrade = 'A' | 'B' | 'C' | 'Premium' | 'Standard';

export interface Lot {
  id: string;
  farmerId: string;
  
  // Crop Details
  cropName: string;
  cropCategory: CropCategory;
  variety?: string;
  
  // Quantity
  quantity: number; // in quintals
  unit: 'quintal' | 'kg' | 'ton';
  minimumOrderQuantity?: number;
  
  // Quality
  qualityGrade: QualityGrade;
  qualityCertificate?: string;
  isOrganic: boolean;
  organicCertificate?: string;
  
  // Pricing
  pricePerUnit: number;
  currency: string;
  negotiable: boolean;
  
  // Location
  location: {
    state: string;
    district: string;
    village?: string;
    pincode?: string;
  };
  
  // Availability
  status: LotStatus;
  availableFrom: string;
  availableUntil?: string;
  harvestDate?: string;
  
  // Images
  images: string[];
  primaryImage?: string;
  
  // Description
  title: string;
  description?: string;
  tags?: string[];
  
  // Packaging & Delivery
  packagingType?: string;
  deliveryAvailable: boolean;
  deliveryCharges?: number;
  
  // Statistics
  views: number;
  inquiries: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  soldAt?: string;
  expiresAt?: string;
}

export interface LotInquiry {
  id: string;
  lotId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  
  message: string;
  requestedQuantity: number;
  offeredPrice?: number;
  
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  
  createdAt: string;
  respondedAt?: string;
}

export interface LotBookmark {
  id: string;
  lotId: string;
  userId: string;
  createdAt: string;
}

// ============================================================================
// FARMER INTERFACES
// ============================================================================

export interface Farmer {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  profileImage?: string;
  
  // Location
  state: string;
  district: string;
  block?: string;
  village?: string;
  pincode?: string;
  address?: string;
  
  // Farm Category
  category: FarmerCategory;
  farmingExperience: number; // in years
  farmingType: FarmingType;
  
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  
  // Verification
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  
  // Settings
  language: string;
  notificationsEnabled: boolean;
  smsEnabled: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

export interface FarmDetails {
  id: string;
  farmerId: string;
  
  // Land Details
  totalArea: number; // in acres
  cultivableArea: number; // in acres
  irrigatedArea?: number; // in acres
  
  // Infrastructure
  irrigationType: IrrigationType[];
  hasWarehouse: boolean;
  warehouseCapacity?: number; // in quintals
  
  // Equipment
  hasOwnEquipment: boolean;
  equipmentList?: string[];
  
  // Soil Details
  soilType?: string;
  soilHealthCard?: string;
  lastSoilTestDate?: string;
  
  // Location Coordinates
  latitude?: number;
  longitude?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface FarmerDocument {
  id: string;
  farmerId: string;
  
  // Document Details
  type: DocumentType;
  documentNumber: string;
  documentName: string;
  
  // File
  fileUrl: string;
  fileType: string; // 'image/jpeg', 'application/pdf', etc.
  fileSize: number; // in bytes
  
  // Verification
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  
  // Metadata
  uploadedAt: string;
  expiryDate?: string;
  notes?: string;
}

export interface BankDetails {
  id: string;
  farmerId: string;
  
  // Bank Information
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  
  // Verification
  isVerified: boolean;
  verifiedAt?: string;
  
  // Settings
  isPrimary: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  farmerId: string;
  
  // Address Type
  type: 'home' | 'farm' | 'warehouse';
  isPrimary: boolean;
  
  // Location Details
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
  
  // Coordinates
  latitude?: number;
  longitude?: number;
  
  // Contact
  contactName?: string;
  contactPhone?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface FarmerStats {
  farmerId: string;
  
  // Crop Stats
  totalCrops: number;
  activeCrops: number;
  harvestedCrops: number;
  totalHarvestQuantity: number; // in quintals
  
  // Financial Stats
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  averageYield: number; // per acre
  
  // Market Stats
  totalSales: number;
  successfulTransactions: number;
  averagePrice: number; // per quintal
  
  // Engagement Stats
  coursesCompleted: number;
  advisoriesViewed: number;
  forumsParticipated: number;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Last Updated
  calculatedAt: string;
}

export interface FarmerPreferences {
  farmerId: string;
  
  // Notification Preferences
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  
  // Notification Types
  priceAlerts: boolean;
  weatherAlerts: boolean;
  advisoryAlerts: boolean;
  schemeAlerts: boolean;
  marketAlerts: boolean;
  
  // App Preferences
  language: string;
  currency: string;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  
  // Privacy
  profileVisibility: 'public' | 'private';
  showContactInfo: boolean;
  showLocation: boolean;
  
  // Metadata
  updatedAt: string;
}

export interface FarmerRating {
  id: string;
  farmerId: string;
  
  // Rating Details
  overallRating: number; // 1-5
  reliabilityScore: number; // 1-5
  qualityScore: number; // 1-5
  communicationScore: number; // 1-5
  
  // Statistics
  totalRatings: number;
  positiveReviews: number;
  negativeReviews: number;
  
  // Transaction Stats
  successfulDeals: number;
  cancelledDeals: number;
  disputedDeals: number;
  
  // Last Updated
  calculatedAt: string;
}

export interface FarmerActivity {
  id: string;
  farmerId: string;
  
  // Activity Details
  type: 'crop' | 'market' | 'learning' | 'advisory' | 'scheme' | 'transport' | 'wallet';
  action: string;
  description: string;
  
  // Related Entities
  relatedEntityId?: string;
  relatedEntityType?: string;
  
  // Metadata
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FarmerAchievement {
  id: string;
  farmerId: string;
  
  // Achievement Details
  type: 'milestone' | 'badge' | 'certificate';
  title: string;
  description: string;
  icon: string;
  
  // Criteria
  category: string;
  target: number;
  current: number;
  isCompleted: boolean;
  
  // Reward
  rewardType?: 'points' | 'badge' | 'certificate';
  rewardValue?: number;
  
  // Dates
  earnedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface KYCDetails {
  farmerId: string;
  
  // Personal Details
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  fatherName?: string;
  
  // Identity
  aadhaarNumber?: string;
  panNumber?: string;
  voterIdNumber?: string;
  
  // Address Proof
  addressProofType?: DocumentType;
  addressProofNumber?: string;
  
  // Status
  kycStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  
  // Metadata
  submittedAt: string;
  updatedAt: string;
}

// ============================================================================
// LOT REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateLotRequest {
  cropName: string;
  cropCategory: CropCategory;
  variety?: string;
  quantity: number;
  unit: 'quintal' | 'kg' | 'ton';
  qualityGrade: QualityGrade;
  isOrganic: boolean;
  pricePerUnit: number;
  negotiable: boolean;
  location: {
    state: string;
    district: string;
    village?: string;
    pincode?: string;
  };
  availableFrom: string;
  availableUntil?: string;
  harvestDate?: string;
  title: string;
  description?: string;
  images?: string[];
  deliveryAvailable: boolean;
  deliveryCharges?: number;
}

export interface UpdateLotRequest {
  quantity?: number;
  pricePerUnit?: number;
  negotiable?: boolean;
  availableUntil?: string;
  status?: LotStatus;
  description?: string;
  images?: string[];
  deliveryAvailable?: boolean;
  deliveryCharges?: number;
}

export interface LotSearchFilters {
  cropName?: string;
  cropCategory?: CropCategory;
  state?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  qualityGrade?: QualityGrade;
  isOrganic?: boolean;
  status?: LotStatus;
  searchQuery?: string;
}

export interface LotListResponse {
  lots: Lot[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// FARMER REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateFarmerRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  state: string;
  district: string;
  village?: string;
  pincode?: string;
  category: FarmerCategory;
  farmingType: FarmingType;
}

export interface UpdateFarmerRequest {
  name?: string;
  email?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  pincode?: string;
  address?: string;
  category?: FarmerCategory;
  farmingExperience?: number;
  farmingType?: FarmingType;
  profileImage?: string;
}

export interface UpdateFarmDetailsRequest {
  totalArea?: number;
  cultivableArea?: number;
  irrigatedArea?: number;
  irrigationType?: IrrigationType[];
  hasWarehouse?: boolean;
  warehouseCapacity?: number;
  hasOwnEquipment?: boolean;
  equipmentList?: string[];
  soilType?: string;
  latitude?: number;
  longitude?: number;
}

export interface UploadDocumentRequest {
  type: DocumentType;
  documentNumber: string;
  file: File | Blob;
  expiryDate?: string;
  notes?: string;
}

export interface AddBankDetailsRequest {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  accountType: 'savings' | 'current';
  isPrimary: boolean;
}

export interface AddAddressRequest {
  type: 'home' | 'farm' | 'warehouse';
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  pincode: string;
  contactName?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdatePreferencesRequest {
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  priceAlerts?: boolean;
  weatherAlerts?: boolean;
  advisoryAlerts?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  profileVisibility?: 'public' | 'private';
}

export interface FarmerProfileResponse {
  farmer: Farmer;
  farmDetails: FarmDetails;
  stats: FarmerStats;
  rating: FarmerRating;
  achievements: FarmerAchievement[];
  isProfileComplete: boolean;
  completionPercentage: number;
}

export interface VerifyFarmerRequest {
  farmerId: string;
  verificationType: 'phone' | 'email' | 'kyc' | 'document';
  verificationCode?: string;
  documentId?: string;
}

export interface VerifyFarmerResponse {
  success: boolean;
  message: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface FarmerSearchFilters {
  state?: string;
  district?: string;
  category?: FarmerCategory;
  farmingType?: FarmingType;
  isVerified?: boolean;
  minRating?: number;
  searchQuery?: string;
}

export interface FarmerSortOptions {
  sortBy: 'name' | 'rating' | 'experience' | 'area' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface FarmerListResponse {
  farmers: Farmer[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const FARMER_CATEGORIES: Record<FarmerCategory, { label: string; maxArea: number }> = {
  marginal: { label: 'Marginal Farmer', maxArea: 2.5 },
  small: { label: 'Small Farmer', maxArea: 5 },
  medium: { label: 'Medium Farmer', maxArea: 10 },
  large: { label: 'Large Farmer', maxArea: Infinity },
};

export const FARMING_TYPES: Record<FarmingType, string> = {
  organic: 'Organic Farming',
  conventional: 'Conventional Farming',
  integrated: 'Integrated Farming',
  natural: 'Natural Farming',
};

export const IRRIGATION_TYPES: Record<IrrigationType, string> = {
  canal: 'Canal Irrigation',
  borewell: 'Borewell',
  drip: 'Drip Irrigation',
  sprinkler: 'Sprinkler Irrigation',
  rainfed: 'Rainfed',
};

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  'voter-id': 'Voter ID',
  'land-document': 'Land Document',
  'bank-passbook': 'Bank Passbook',
  'kisan-card': 'Kisan Credit Card',
  'ration-card': 'Ration Card',
};

export const LOT_STATUS_LABELS: Record<LotStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  SOLD: 'Sold',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export const CROP_CATEGORIES: Record<CropCategory, string> = {
  cereals: 'Cereals',
  pulses: 'Pulses',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  spices: 'Spices',
  oilseeds: 'Oilseeds',
  'cash-crops': 'Cash Crops',
};

export const QUALITY_GRADES: Record<QualityGrade, string> = {
  Premium: 'Premium Quality',
  A: 'Grade A',
  B: 'Grade B',
  C: 'Grade C',
  Standard: 'Standard Quality',
};

export const STATES_LIST = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];
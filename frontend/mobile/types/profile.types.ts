export interface UserProfile {
  id: string;
  phoneNumber: string;
  email?: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  
  // Location
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farm Details
  farmSize?: number;
  farmSizeUnit?: 'acre' | 'hectare';
  soilType?: string;
  irrigationType?: string;
  
  // KYC Status
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycRejectionReason?: string;
  
  // Preferences
  language: string;
  receiveNotifications: boolean;
  receiveMarketUpdates: boolean;
  receivePriceAlerts: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface BankDetails {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  type: 'aadhaar' | 'pan' | 'land_records' | 'bank_passbook' | 'other';
  documentNumber?: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    marketUpdates: boolean;
    priceAlerts: boolean;
    weatherAlerts: boolean;
    cropReminders: boolean;
    tradeMessages: boolean;
  };
  privacy: {
    showProfile: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  dataUsage: {
    autoDownloadImages: boolean;
    autoDownloadVideos: boolean;
    dataSaverMode: boolean;
  };
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  questions: HelpQuestion[];
}

export interface HelpQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  responses: TicketResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}
export type SchemeCategory = 
  | 'subsidy'
  | 'loan'
  | 'insurance'
  | 'training'
  | 'equipment'
  | 'infrastructure'
  | 'marketing'
  | 'other';

export type ApplicationStatus = 
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'pending-documents'
  | 'completed';

export interface GovernmentScheme {
  id: string;
  name: string;
  category: SchemeCategory;
  description: string;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[]; // Changed from 'documents' to match usage
  department?: string; // Changed from 'authority' to match usage
  launchedBy?: string; // Central/State/District
  authority?: string; // e.g., "Ministry of Agriculture"
  officialWebsite?: string; // Changed from 'applicationUrl' to match usage
  applicationUrl?: string; // Keep for backward compatibility
  contactNumber?: string; // Changed from 'helplineNumber' to match usage
  helplineNumber?: string; // Keep for backward compatibility
  startDate?: string; // Added based on usage
  endDate?: string; // Changed from 'lastDate' to match usage
  lastDate?: string; // Keep for backward compatibility
  budgetAmount?: string;
  coverageArea?: string; // All India / State specific
  targetBeneficiaries?: string; // Added based on common use
  icon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  farmerId?: string;
  status: ApplicationStatus;
  appliedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  completedDate?: string;
  remarks?: string | null;
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  trackingId?: string;
}

export interface SchemeFilters {
  category?: SchemeCategory;
  launchedBy?: string;
  searchQuery?: string;
  status?: ApplicationStatus;
  state?: string;
  district?: string;
  isActive?: boolean;
}

export interface SchemeEligibilityCheck {
  isEligible: boolean;
  reasons?: string[];
  missingRequirements?: string[];
  recommendations?: string[];
}

// Alias for backward compatibility
export type Scheme = GovernmentScheme;
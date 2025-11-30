import { GovernmentScheme, SchemeFilters, SchemeApplication, SchemeEligibilityCheck } from '@/types/scheme.types';

const MOCK_SCHEMES: GovernmentScheme[] = [
  {
    id: '1',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'subsidy',
    description: 'Direct income support to all landholding farmers families to supplement financial needs for agriculture and allied activities.',
    benefits: [
      '₹6,000 per year in three equal installments',
      'Direct Benefit Transfer to bank accounts',
      'No intermediaries involved',
      'Covers all landholding farmers',
    ],
    eligibility: [
      'Must be a farmer with cultivable land',
      'Family should own agricultural land',
      'Should have valid Aadhaar card',
      'Bank account should be linked with Aadhaar',
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership Papers',
      'Bank Account Details',
      'Passport Size Photo',
    ],
    department: 'Ministry of Agriculture & Farmers Welfare',
    launchedBy: 'Central',
    authority: 'Government of India',
    officialWebsite: 'https://pmkisan.gov.in',
    contactNumber: '155261 / 1800115526',
    startDate: '2019-02-01',
    endDate: null,
    budgetAmount: '₹75,000 Crore',
    coverageArea: 'All India',
    targetBeneficiaries: '12 Crore farmers',
    icon: '🌾',
    isActive: true,
  },
  {
    id: '2',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'insurance',
    description: 'Crop insurance scheme to provide financial support to farmers in case of crop failure due to natural calamities.',
    benefits: [
      'Low premium rates',
      'Coverage for all stages of crop cycle',
      'Quick settlement of claims',
      'Protection against natural calamities',
    ],
    eligibility: [
      'All farmers growing notified crops',
      'Applicable for both loanee and non-loanee farmers',
      'Should have insurable interest in the crop',
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Land Records',
      'Bank Account Details',
      'Sowing Certificate',
    ],
    department: 'Ministry of Agriculture & Farmers Welfare',
    launchedBy: 'Central',
    authority: 'Government of India',
    officialWebsite: 'https://pmfby.gov.in',
    contactNumber: '1800-180-1551',
    startDate: '2016-04-01',
    budgetAmount: '₹16,000 Crore',
    coverageArea: 'All India',
    icon: '🛡️',
    isActive: true,
  },
  {
    id: '3',
    name: 'Kisan Credit Card (KCC)',
    category: 'loan',
    description: 'Credit facility for farmers to meet short term credit requirements for cultivation and other expenses.',
    benefits: [
      'Flexible credit limit',
      'Interest subvention of 2%',
      'Prompt repayment incentive of 3%',
      'Simple documentation',
    ],
    eligibility: [
      'Individual/Joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees & sharecroppers',
      'Self Help Groups of farmers',
    ],
    requiredDocuments: [
      'KCC Application Form',
      'Identity Proof',
      'Address Proof',
      'Land Documents',
      'Passport Size Photos',
    ],
    department: 'Ministry of Agriculture & Farmers Welfare',
    launchedBy: 'Central',
    authority: 'NABARD',
    officialWebsite: 'https://www.nabard.org',
    contactNumber: '1800-270-3333',
    startDate: '1998-08-01',
    coverageArea: 'All India',
    icon: '💳',
    isActive: true,
  },
];

class SchemeService {
  async getAllSchemes(): Promise<GovernmentScheme[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_SCHEMES;
  }

  async getSchemeById(id: string): Promise<GovernmentScheme | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SCHEMES.find(scheme => scheme.id === id) || null;
  }

  async getFilteredSchemes(filters: SchemeFilters): Promise<GovernmentScheme[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...MOCK_SCHEMES];

    if (filters.category) {
      filtered = filtered.filter(scheme => scheme.category === filters.category);
    }

    if (filters.launchedBy) {
      filtered = filtered.filter(scheme => scheme.launchedBy === filters.launchedBy);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        (scheme.department && scheme.department.toLowerCase().includes(query))
      );
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(scheme => scheme.isActive === filters.isActive);
    }

    return filtered;
  }

  async getBookmarkedSchemes(bookmarkedIds: string[]): Promise<GovernmentScheme[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SCHEMES.filter(scheme => bookmarkedIds.includes(scheme.id));
  }

  async checkEligibility(schemeId: string, farmerData: any): Promise<SchemeEligibilityCheck> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock eligibility check
    return {
      isEligible: true,
      reasons: ['Meets all eligibility criteria'],
      recommendations: ['Prepare all required documents before applying'],
    };
  }

  async applyForScheme(schemeId: string, applicationData: any): Promise<SchemeApplication> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock application submission
    const application: SchemeApplication = {
      id: Date.now().toString(),
      schemeId,
      status: 'submitted',
      appliedDate: new Date().toISOString(),
      trackingId: `TRK${Date.now()}`,
    };
    
    return application;
  }

  async getMyApplications(): Promise<SchemeApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock applications
    return [
      {
        id: '1',
        schemeId: '1',
        status: 'approved',
        appliedDate: '2024-11-01T10:00:00Z',
        approvedDate: '2024-11-15T10:00:00Z',
        trackingId: 'TRK1234567890',
        remarks: 'Application approved. Benefits will be credited to your account.',
      },
      {
        id: '2',
        schemeId: '2',
        status: 'under-review',
        appliedDate: '2024-11-20T10:00:00Z',
        trackingId: 'TRK0987654321',
        remarks: null,
      },
    ];
  }

  async getApplicationStatus(applicationId: string): Promise<SchemeApplication | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const applications = await this.getMyApplications();
    return applications.find(app => app.id === applicationId) || null;
  }

  async withdrawApplication(applicationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock withdrawal
    console.log(`Application ${applicationId} withdrawn`);
  }
}

export const schemeService = new SchemeService();
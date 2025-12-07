export interface GovernmentScheme {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  eligibility: string[];
  benefits: string[];
  howToApply: string[];
  applyUrl: string;
}

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    category: 'Income Support',
    shortDesc: '₹6,000/year direct income support to farmers',
    fullDesc: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector Scheme that provides income support to all landholding farmers\' families across the country. Under this scheme, financial benefit of ₹6,000 per year is provided to eligible farmer families in three equal installments of ₹2,000 each every four months.',
    eligibility: [
      'All landholding farmers with cultivable land',
      'Valid Aadhaar card is mandatory',
      'Active bank account linked to Aadhaar',
      'Land ownership records must be updated',
    ],
    benefits: [
      '₹2,000 every 4 months (3 installments per year)',
      'Direct bank transfer (DBT) to farmer\'s account',
      'No intermediary - direct to beneficiary',
      'Covers all farmers irrespective of land size',
    ],
    howToApply: [
      'Visit the PM-KISAN official portal',
      'Click on "Farmer\'s Corner" and select "New Farmer Registration"',
      'Enter Aadhaar number and click "Get OTP"',
      'Fill in required details (name, land details, bank account)',
      'Upload land ownership documents',
      'Submit application and note the registration number',
    ],
    applyUrl: 'https://pmkisan.gov.in/',
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    category: 'Agricultural Services',
    shortDesc: 'Free soil testing and customized fertilizer recommendations',
    fullDesc: 'The Soil Health Card Scheme aims to issue soil health cards to all farmers in the country. The card carries crop-wise recommendations of nutrients and fertilizers required for individual farms to help farmers improve productivity through judicious use of inputs.',
    eligibility: [
      'All farmers with agricultural land',
      'Individual farmers and farmer groups',
      'Available in all states and UTs',
    ],
    benefits: [
      'Free soil testing facility',
      'Crop-specific nutrient recommendations',
      'Reduces fertilizer costs by 8-10%',
      'Increases crop yield by 5-6%',
      'Soil health monitoring every 2 years',
    ],
    howToApply: [
      'Contact your nearest agriculture department office',
      'Submit land details and farmer ID',
      'Collect soil sample as per guidelines',
      'Submit sample at soil testing laboratory',
      'Receive Soil Health Card within 15-20 days',
    ],
    applyUrl: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Crop Insurance',
    shortDesc: 'Comprehensive crop insurance at subsidized premium',
    fullDesc: 'PMFBY provides comprehensive insurance coverage against crop loss to farmers. It covers all stages from sowing to post-harvest including losses arising from prevented sowing and mid-season adversities. The scheme is implemented by empanelled general insurance companies.',
    eligibility: [
      'All farmers including sharecroppers and tenant farmers',
      'Mandatory for farmers availing crop loans',
      'Voluntary for non-loanee farmers',
      'Coverage for notified crops in notified areas',
    ],
    benefits: [
      'Only 2% premium for Kharif crops',
      'Only 1.5% premium for Rabi crops',
      'Maximum 5% premium for commercial/horticultural crops',
      'Covers prevented sowing, mid-season adversities, post-harvest losses',
      'Claims settled within 15 days of assessment',
    ],
    howToApply: [
      'Visit bank for loanee farmers (automatic enrollment)',
      'For non-loanee: Visit Common Service Centers (CSC)',
      'Or apply online at PMFBY portal',
      'Choose crops and sum insured',
      'Pay premium amount',
      'Receive policy within 7 days',
    ],
    applyUrl: 'https://pmfby.gov.in/',
  },
  {
    id: 'kisan-credit-card',
    name: 'Kisan Credit Card (KCC)',
    category: 'Credit Facility',
    shortDesc: 'Easy credit facility for farmers at low interest rates',
    fullDesc: 'Kisan Credit Card scheme provides timely and adequate credit support to farmers for their cultivation and other needs including purchase of agricultural inputs, maintenance of farm assets and consumption requirements. Special benefits are provided during natural calamities.',
    eligibility: [
      'Farmers - individual/joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees and sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs)',
      'Minimum age: 18 years, Maximum: 75 years',
    ],
    benefits: [
      'Credit limit based on land holding and crops',
      'Interest rate: 7% per annum',
      '3% interest subvention available',
      'Timely repayment: Additional 3% incentive',
      'Personal accident insurance up to ₹50,000',
    ],
    howToApply: [
      'Visit nearest branch of any Commercial/Cooperative/RRB bank',
      'Fill KCC application form',
      'Submit land ownership documents',
      'Provide Aadhaar, PAN card, and bank passbook',
      'Bank will assess and sanction credit limit',
      'Receive KCC within 15-30 days',
    ],
    applyUrl: 'https://www.india.gov.in/spotlight/kisan-credit-card-hassle-free-credit-farmers',
  },
  {
    id: 'kisan-samman-nidhi',
    name: 'Kisan Samman Nidhi',
    category: 'Income Support',
    shortDesc: 'Direct income support for small and marginal farmers',
    fullDesc: 'The scheme aims to supplement the financial needs of farmers in procuring various inputs to ensure proper crop health and appropriate yields. The financial benefit is transferred directly to the bank accounts of eligible farmers under Direct Benefit Transfer mode.',
    eligibility: [
      'Small and marginal farmers',
      'Families owning cultivable land',
      'Valid Aadhaar card mandatory',
      'Land records must be updated in state database',
    ],
    benefits: [
      'Annual benefit of ₹6,000',
      'Paid in three installments of ₹2,000',
      'Direct bank transfer',
      'No processing fee',
      'Automatic renewal if eligible',
    ],
    howToApply: [
      'Visit PM-KISAN portal or CSC',
      'Register with Aadhaar number',
      'Fill farmer details and land information',
      'Upload required documents',
      'Submit application',
      'Track status online',
    ],
    applyUrl: 'https://pmkisan.gov.in/',
  },
  {
    id: 'paramparagat-krishi',
    name: 'Paramparagat Krishi Vikas Yojana',
    category: 'Organic Farming',
    shortDesc: 'Financial support for organic farming practices',
    fullDesc: 'PKVY promotes commercial organic production through certified organic farming. The scheme encourages farmers to adopt organic farming practices and helps in marketing of organic products. Organic farming is promoted through cluster approach and participatory guarantee system (PGS) certification.',
    eligibility: [
      'Individual farmers in clusters of 50 or more',
      'Farmers willing to adopt organic farming',
      'Land must be free from chemical inputs for 2-3 years',
      'Participation in cluster farming mandatory',
    ],
    benefits: [
      '₹50,000 per hectare over 3 years',
      'Free training on organic farming',
      'Support for certification costs',
      'Marketing assistance for organic produce',
      'Premium price for certified organic products',
    ],
    howToApply: [
      'Contact District Agriculture Officer',
      'Form or join a cluster of 50 farmers',
      'Submit application through cluster',
      'Attend training programs',
      'Begin organic farming practices',
      'Apply for PGS certification',
    ],
    applyUrl: 'https://pgsindia-ncof.gov.in/',
  },
];

export const SCHEME_CATEGORIES = [
  { id: 'all', name: 'All Schemes', icon: 'list' },
  { id: 'Income Support', name: 'Income Support', icon: 'cash' },
  { id: 'Crop Insurance', name: 'Crop Insurance', icon: 'shield-checkmark' },
  { id: 'Credit Facility', name: 'Credit Facility', icon: 'card' },
  { id: 'Agricultural Services', name: 'Services', icon: 'construct' },
  { id: 'Organic Farming', name: 'Organic Farming', icon: 'leaf' },
];

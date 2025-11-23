import { SelectOption } from '@/components/common/Select';

// Crop Types
export const CROP_TYPES: SelectOption[] = [
  { label: 'Groundnut', value: 'GROUNDNUT', icon: '🥜' },
  { label: 'Cotton', value: 'COTTON', icon: '🌱' },
  { label: 'Wheat', value: 'WHEAT', icon: '🌾' },
  { label: 'Rice', value: 'RICE', icon: '🌾' },
  { label: 'Soybean', value: 'SOYBEAN', icon: '🫘' },
  { label: 'Maize', value: 'MAIZE', icon: '🌽' },
  { label: 'Sugarcane', value: 'SUGARCANE', icon: '🎋' },
  { label: 'Chickpea', value: 'CHICKPEA', icon: '🫘' },
  { label: 'Pulses', value: 'PULSES', icon: '🫘' },
  { label: 'Others', value: 'OTHERS', icon: '🌿' },
];

// Crop Varieties by Type
export const CROP_VARIETIES: Record<string, SelectOption[]> = {
  GROUNDNUT: [
    { label: 'Bold', value: 'BOLD' },
    { label: 'Java', value: 'JAVA' },
    { label: 'TJ', value: 'TJ' },
    { label: 'Red Natal', value: 'RED_NATAL' },
    { label: 'Spanish', value: 'SPANISH' },
    { label: 'Others', value: 'OTHERS' },
  ],
  COTTON: [
    { label: 'DCH-32', value: 'DCH_32' },
    { label: 'Bunny Bt', value: 'BUNNY_BT' },
    { label: 'RCH-2', value: 'RCH_2' },
    { label: 'MECH-162', value: 'MECH_162' },
    { label: 'Others', value: 'OTHERS' },
  ],
  WHEAT: [
    { label: 'HD-2967', value: 'HD_2967' },
    { label: 'DBW-187', value: 'DBW_187' },
    { label: 'PBW-725', value: 'PBW_725' },
    { label: 'Sharbati', value: 'SHARBATI' },
    { label: 'Lokwan', value: 'LOKWAN' },
    { label: 'Others', value: 'OTHERS' },
  ],
  RICE: [
    { label: 'Basmati', value: 'BASMATI' },
    { label: 'Sona Masoori', value: 'SONA_MASOORI' },
    { label: 'IR-64', value: 'IR_64' },
    { label: 'Swarna', value: 'SWARNA' },
    { label: 'PR-106', value: 'PR_106' },
    { label: 'Others', value: 'OTHERS' },
  ],
  SOYBEAN: [
    { label: 'JS-335', value: 'JS_335' },
    { label: 'JS-95-60', value: 'JS_95_60' },
    { label: 'NRC-37', value: 'NRC_37' },
    { label: 'MAUS-71', value: 'MAUS_71' },
    { label: 'Others', value: 'OTHERS' },
  ],
  MAIZE: [
    { label: 'Hybrid', value: 'HYBRID' },
    { label: 'Desi', value: 'DESI' },
    { label: 'Sweet Corn', value: 'SWEET_CORN' },
    { label: 'Others', value: 'OTHERS' },
  ],
  SUGARCANE: [
    { label: 'Co-0238', value: 'CO_0238' },
    { label: 'Co-86032', value: 'CO_86032' },
    { label: 'Co-0118', value: 'CO_0118' },
    { label: 'Others', value: 'OTHERS' },
  ],
  CHICKPEA: [
    { label: 'Kabuli', value: 'KABULI' },
    { label: 'Desi', value: 'DESI' },
    { label: 'Others', value: 'OTHERS' },
  ],
  PULSES: [
    { label: 'Tur/Arhar', value: 'TUR' },
    { label: 'Moong', value: 'MOONG' },
    { label: 'Urad', value: 'URAD' },
    { label: 'Masoor', value: 'MASOOR' },
    { label: 'Others', value: 'OTHERS' },
  ],
  OTHERS: [{ label: 'Other Variety', value: 'OTHER' }],
};

// Indian States
export const STATES: SelectOption[] = [
  { label: 'Andhra Pradesh', value: 'ANDHRA_PRADESH' },
  { label: 'Arunachal Pradesh', value: 'ARUNACHAL_PRADESH' },
  { label: 'Assam', value: 'ASSAM' },
  { label: 'Bihar', value: 'BIHAR' },
  { label: 'Chhattisgarh', value: 'CHHATTISGARH' },
  { label: 'Goa', value: 'GOA' },
  { label: 'Gujarat', value: 'GUJARAT' },
  { label: 'Haryana', value: 'HARYANA' },
  { label: 'Himachal Pradesh', value: 'HIMACHAL_PRADESH' },
  { label: 'Jharkhand', value: 'JHARKHAND' },
  { label: 'Karnataka', value: 'KARNATAKA' },
  { label: 'Kerala', value: 'KERALA' },
  { label: 'Madhya Pradesh', value: 'MADHYA_PRADESH' },
  { label: 'Maharashtra', value: 'MAHARASHTRA' },
  { label: 'Manipur', value: 'MANIPUR' },
  { label: 'Meghalaya', value: 'MEGHALAYA' },
  { label: 'Mizoram', value: 'MIZORAM' },
  { label: 'Nagaland', value: 'NAGALAND' },
  { label: 'Odisha', value: 'ODISHA' },
  { label: 'Punjab', value: 'PUNJAB' },
  { label: 'Rajasthan', value: 'RAJASTHAN' },
  { label: 'Sikkim', value: 'SIKKIM' },
  { label: 'Tamil Nadu', value: 'TAMIL_NADU' },
  { label: 'Telangana', value: 'TELANGANA' },
  { label: 'Tripura', value: 'TRIPURA' },
  { label: 'Uttar Pradesh', value: 'UTTAR_PRADESH' },
  { label: 'Uttarakhand', value: 'UTTARAKHAND' },
  { label: 'West Bengal', value: 'WEST_BENGAL' },
];

// Districts by State (Sample - Add more as needed)
export const DISTRICTS: Record<string, SelectOption[]> = {
  GUJARAT: [
    { label: 'Ahmedabad', value: 'AHMEDABAD' },
    { label: 'Surat', value: 'SURAT' },
    { label: 'Vadodara', value: 'VADODARA' },
    { label: 'Rajkot', value: 'RAJKOT' },
    { label: 'Bhavnagar', value: 'BHAVNAGAR' },
    { label: 'Jamnagar', value: 'JAMNAGAR' },
    { label: 'Junagadh', value: 'JUNAGADH' },
    { label: 'Gandhinagar', value: 'GANDHINAGAR' },
    { label: 'Anand', value: 'ANAND' },
    { label: 'Mehsana', value: 'MEHSANA' },
  ],
  MAHARASHTRA: [
    { label: 'Mumbai', value: 'MUMBAI' },
    { label: 'Pune', value: 'PUNE' },
    { label: 'Nagpur', value: 'NAGPUR' },
    { label: 'Nashik', value: 'NASHIK' },
    { label: 'Aurangabad', value: 'AURANGABAD' },
    { label: 'Solapur', value: 'SOLAPUR' },
    { label: 'Kolhapur', value: 'KOLHAPUR' },
  ],
  // Add more states and districts as needed
};

// Payment Status
export const PAYMENT_STATUS: SelectOption[] = [
  { label: 'Pending', value: 'PENDING', icon: '⏳' },
  { label: 'Processing', value: 'PROCESSING', icon: '⚙️' },
  { label: 'Completed', value: 'COMPLETED', icon: '✅' },
  { label: 'Failed', value: 'FAILED', icon: '❌' },
];

// Lot Status
export const LOT_STATUS: SelectOption[] = [
  { label: 'Draft', value: 'DRAFT', icon: '📝' },
  { label: 'Active', value: 'ACTIVE', icon: '✅' },
  { label: 'Sold', value: 'SOLD', icon: '🎉' },
  { label: 'Expired', value: 'EXPIRED', icon: '⏰' },
  { label: 'Cancelled', value: 'CANCELLED', icon: '❌' },
];

// Transportation Types
export const TRANSPORT_TYPES: SelectOption[] = [
  { label: 'Open Truck', value: 'OPEN_TRUCK', icon: '🚛' },
  { label: 'Closed Container', value: 'CLOSED_CONTAINER', icon: '📦' },
  { label: 'Refrigerated', value: 'REFRIGERATED', icon: '❄️' },
];

// Storage Types
export const STORAGE_TYPES: SelectOption[] = [
  { label: 'Cold Storage', value: 'COLD_STORAGE', icon: '❄️' },
  { label: 'Dry Storage', value: 'DRY_STORAGE', icon: '🏪' },
  { label: 'Climate Controlled', value: 'CLIMATE_CONTROLLED', icon: '🌡️' },
];
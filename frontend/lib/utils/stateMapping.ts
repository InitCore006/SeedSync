/**
 * State name to code mapping for backend API
 * Backend expects snake_case codes, frontend displays proper names
 */

export const STATE_NAME_TO_CODE: Record<string, string> = {
  'Andhra Pradesh': 'andhra_pradesh',
  'Arunachal Pradesh': 'arunachal_pradesh',
  'Assam': 'assam',
  'Bihar': 'bihar',
  'Chhattisgarh': 'chhattisgarh',
  'Goa': 'goa',
  'Gujarat': 'gujarat',
  'Haryana': 'haryana',
  'Himachal Pradesh': 'himachal_pradesh',
  'Jharkhand': 'jharkhand',
  'Karnataka': 'karnataka',
  'Kerala': 'kerala',
  'Madhya Pradesh': 'madhya_pradesh',
  'Maharashtra': 'maharashtra',
  'Manipur': 'manipur',
  'Meghalaya': 'meghalaya',
  'Mizoram': 'mizoram',
  'Nagaland': 'nagaland',
  'Odisha': 'odisha',
  'Punjab': 'punjab',
  'Rajasthan': 'rajasthan',
  'Sikkim': 'sikkim',
  'Tamil Nadu': 'tamil_nadu',
  'Telangana': 'telangana',
  'Tripura': 'tripura',
  'Uttar Pradesh': 'uttar_pradesh',
  'Uttarakhand': 'uttarakhand',
  'West Bengal': 'west_bengal',
  'Andaman and Nicobar Islands': 'andaman_nicobar',
  'Chandigarh': 'chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'dadra_nagar_haveli_daman_diu',
  'Delhi': 'delhi',
  'Jammu and Kashmir': 'jammu_kashmir',
  'Ladakh': 'ladakh',
  'Lakshadweep': 'lakshadweep',
  'Puducherry': 'puducherry',
};

export const STATE_CODE_TO_NAME: Record<string, string> = {
  'andhra_pradesh': 'Andhra Pradesh',
  'arunachal_pradesh': 'Arunachal Pradesh',
  'assam': 'Assam',
  'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh',
  'goa': 'Goa',
  'gujarat': 'Gujarat',
  'haryana': 'Haryana',
  'himachal_pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'madhya_pradesh': 'Madhya Pradesh',
  'maharashtra': 'Maharashtra',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'odisha': 'Odisha',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'sikkim': 'Sikkim',
  'tamil_nadu': 'Tamil Nadu',
  'telangana': 'Telangana',
  'tripura': 'Tripura',
  'uttar_pradesh': 'Uttar Pradesh',
  'uttarakhand': 'Uttarakhand',
  'west_bengal': 'West Bengal',
  'andaman_nicobar': 'Andaman and Nicobar Islands',
  'chandigarh': 'Chandigarh',
  'dadra_nagar_haveli_daman_diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'delhi': 'Delhi',
  'jammu_kashmir': 'Jammu and Kashmir',
  'ladakh': 'Ladakh',
  'lakshadweep': 'Lakshadweep',
  'puducherry': 'Puducherry',
};

/**
 * Convert state name to backend code
 * @param stateName - Display name like "Maharashtra"
 * @returns Backend code like "maharashtra"
 */
export function stateNameToCode(stateName: string): string {
  return STATE_NAME_TO_CODE[stateName] || stateName.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Convert state code to display name
 * @param stateCode - Backend code like "maharashtra"
 * @returns Display name like "Maharashtra"
 */
export function stateCodeToName(stateCode: string): string {
  return STATE_CODE_TO_NAME[stateCode] || stateCode;
}

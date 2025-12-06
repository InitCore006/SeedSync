/**
 * Crop Types and Constants for SeedSync Platform
 */

export const CROP_TYPES = [
  { value: 'soybean', label: 'Soybean', icon: '🫘' },
  { value: 'mustard', label: 'Mustard', icon: '🌻' },
  { value: 'groundnut', label: 'Groundnut', icon: '🥜' },
  { value: 'sunflower', label: 'Sunflower', icon: '🌻' },
  { value: 'safflower', label: 'Safflower', icon: '🌼' },
  { value: 'sesame', label: 'Sesame', icon: '🌾' },
  { value: 'linseed', label: 'Linseed', icon: '🌿' },
  { value: 'niger', label: 'Niger', icon: '🌱' },
] as const;

export const QUALITY_GRADES = [
  { value: 'A+', label: 'A+ (Premium)', color: '#10B981' },
  { value: 'A', label: 'A (Good)', color: '#3B82F6' },
  { value: 'B', label: 'B (Average)', color: '#F59E0B' },
  { value: 'C', label: 'C (Below Average)', color: '#EF4444' },
] as const;

export const LOT_STATUS = {
  available: { label: 'Available', color: '#10B981', icon: 'checkmark-circle' },
  bidding: { label: 'Bidding', color: '#F59E0B', icon: 'time' },
  sold: { label: 'Sold', color: '#3B82F6', icon: 'cash' },
  delivered: { label: 'Delivered', color: '#6B7280', icon: 'checkbox' },
} as const;

export const BID_STATUS = {
  pending: { label: 'Pending', color: '#F59E0B', icon: 'time' },
  accepted: { label: 'Accepted', color: '#10B981', icon: 'checkmark-circle' },
  rejected: { label: 'Rejected', color: '#EF4444', icon: 'close-circle' },
} as const;

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: '#F59E0B', icon: 'time' },
  processing: { label: 'Processing', color: '#3B82F6', icon: 'refresh' },
  completed: { label: 'Completed', color: '#10B981', icon: 'checkmark-circle' },
  failed: { label: 'Failed', color: '#EF4444', icon: 'close-circle' },
} as const;

export const SHIPMENT_STATUS = {
  pending: { label: 'Pending', color: '#F59E0B', icon: 'time' },
  accepted: { label: 'Accepted', color: '#3B82F6', icon: 'checkmark' },
  in_transit: { label: 'In Transit', color: '#8B5CF6', icon: 'car' },
  delivered: { label: 'Delivered', color: '#10B981', icon: 'checkmark-circle' },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle' },
} as const;

export const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Immediate Payment' },
  { value: '7_days', label: 'Within 7 Days' },
  { value: '15_days', label: 'Within 15 Days' },
  { value: '30_days', label: 'Within 30 Days' },
] as const;

export const VEHICLE_TYPES = [
  { value: 'truck', label: 'Truck' },
  { value: 'mini_truck', label: 'Mini Truck' },
  { value: 'van', label: 'Van' },
  { value: 'tractor', label: 'Tractor' },
] as const;

export const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli' },
  { value: 'DD', label: 'Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LA', label: 'Ladakh' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
] as const;

// Helper functions
export const getCropLabel = (value: string) => {
  return CROP_TYPES.find(crop => crop.value === value)?.label || value;
};

export const getCropIcon = (value: string) => {
  return CROP_TYPES.find(crop => crop.value === value)?.icon || '🌾';
};

export const getQualityGradeColor = (value: string) => {
  return QUALITY_GRADES.find(grade => grade.value === value)?.color || '#6B7280';
};

export const getStatusInfo = (status: string, type: 'lot' | 'bid' | 'payment' | 'shipment') => {
  switch (type) {
    case 'lot':
      return LOT_STATUS[status as keyof typeof LOT_STATUS] || { label: status, color: '#6B7280', icon: 'help-circle' };
    case 'bid':
      return BID_STATUS[status as keyof typeof BID_STATUS] || { label: status, color: '#6B7280', icon: 'help-circle' };
    case 'payment':
      return PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS] || { label: status, color: '#6B7280', icon: 'help-circle' };
    case 'shipment':
      return SHIPMENT_STATUS[status as keyof typeof SHIPMENT_STATUS] || { label: status, color: '#6B7280', icon: 'help-circle' };
    default:
      return { label: status, color: '#6B7280', icon: 'help-circle' };
  }
};

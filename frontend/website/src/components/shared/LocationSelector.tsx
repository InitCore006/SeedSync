import React, { useEffect } from 'react'
import { Select } from '@components/common/Select'
import { INDIAN_STATES } from '@lib/constants'

interface LocationSelectorProps {
  selectedState: string
  selectedDistrict: string
  onStateChange: (state: string) => void
  onDistrictChange: (district: string) => void
  stateError?: string
  districtError?: string
  required?: boolean
}

// Sample district data - In production, fetch from API
const DISTRICTS_BY_STATE: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  // Add more states and districts as needed
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  stateError,
  districtError,
  required = false,
}) => {
  const districts = selectedState ? (DISTRICTS_BY_STATE[selectedState] || []) : []

  useEffect(() => {
    if (!selectedState) {
      onDistrictChange('')
    }
  }, [selectedState, onDistrictChange])

  const stateOptions = INDIAN_STATES.map((state) => ({
    value: state,
    label: state,
  }))

  const districtOptions = districts.map((district) => ({
    value: district,
    label: district,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="State"
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value)}
        options={stateOptions}
        error={stateError}
        required={required}
      />

      <Select
        label="District"
        value={selectedDistrict}
        onChange={(e) => onDistrictChange(e.target.value)}
        options={districtOptions}
        error={districtError}
        required={required}
        disabled={!selectedState}
      />
    </div>
  )
}
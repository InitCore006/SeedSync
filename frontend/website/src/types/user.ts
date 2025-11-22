export interface FPORegistrationStep1 {
  organization_name: string
  registration_type: 'FPO' | 'COOPERATIVE' | 'PRODUCER_COMPANY'
  registration_number: string
  year_of_registration: number
  total_members: number
  contact_person_name: string
  contact_person_designation: string
}

export interface FPORegistrationStep2 {
  office_address: string
  state: string
  district: string
  block: string
  pincode: string
  latitude?: number
  longitude?: number
  operational_villages: string[]
  total_land_coverage: number
  primary_oilseeds: string[]
}

export interface FPORegistrationStep3 {
  has_storage: boolean
  has_transport: boolean
  uses_logistics_partners: boolean
  average_annual_procurement: number
  warehouses?: Array<{
    warehouse_name: string
    warehouse_type: string
    storage_type: string
    total_capacity: number
    address: string
    state: string
    district: string
    pincode: string
    has_weighbridge: boolean
    has_quality_testing: boolean
    has_security: boolean
  }>
  vehicles?: Array<{
    vehicle_number: string
    vehicle_type: string
    capacity: number
    driver_name: string
    driver_phone: string
  }>
}

export interface FPORegistrationStep4 {
  registration_certificate: File
  gstin: string
  bank_account_number: string
  ifsc_code: string
  bank_name: string
  branch_name: string
  cancelled_cheque: File
  email: string
  phone_number: string
  password: string
  password_confirm: string
}

export interface RegistrationState {
  currentStep: number
  totalSteps: number
  formData: {
    step1?: FPORegistrationStep1
    step2?: FPORegistrationStep2
    step3?: FPORegistrationStep3
    step4?: FPORegistrationStep4
  }
  isSubmitting: boolean
  error: string | null
  sessionId?: string
}
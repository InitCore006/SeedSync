export type FPOType = 'producer-company' | 'cooperative' | 'self-help-group';
export type MembershipStatus = 'not-member' | 'applied' | 'active' | 'inactive';

export interface FPO {
  id: string;
  name: string;
  type: FPOType;
  description: string;
  location: string;
  district: string;
  state: string;
  established: string;
  memberCount: number;
  contactPerson: string;
  phoneNumber: string;
  email?: string;
  services: string[];
  crops: string[];
  benefits: string[];
  membershipFee: number;
  website?: string;
  imageUrl?: string;
}

export interface Membership {
  fpoId: string;
  status: MembershipStatus;
  joinedDate?: string;
  membershipNumber?: string;
  benefits: string[];
}

export interface FPOEvent {
  id: string;
  fpoId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  eventType: 'training' | 'meeting' | 'workshop' | 'field-visit' | 'other';
  isRegistered?: boolean;
}
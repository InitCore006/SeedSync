export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

export type UserRole = 'FARMER' | 'FPO' | 'PROCESSOR' | 'RETAILER' | 'LOGISTICS' | 'WAREHOUSE' | 'GOVERNMENT';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FileUpload {
  uri: string;
  name: string;
  type: string;
}
export interface User {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'client' | 'admin' | 'superadmin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SportObject {
  id: number;
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
  objectType: ObjectType;
  description?: string;
  isActive: boolean;
  pricePerHour: number;
  maxCapacity: number;
  facilities?: any;
  createdAt: string;
  updatedAt: string;
  ownerId?: number;
  reservations?: Reservation[];
}

export type ObjectType = 
  | 'football'
  | 'tennis'
  | 'basketball'
  | 'volleyball'
  | 'swimming'
  | 'gym'
  | 'other';

export interface Reservation {
  id: number;
  objectId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledBy?: number;
  cancellationReason?: string;
  object?: SportObject;
  user?: User;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddObjectForm {
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
  objectType: ObjectType;
  description?: string;
  pricePerHour?: string | number;
  maxCapacity?: string | number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ObjectFilters {
  search?: string;
  type?: ObjectType;
  location?: string;
  page?: number;
  limit?: number;
} 
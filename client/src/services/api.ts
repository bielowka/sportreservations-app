import axios, { AxiosResponse } from 'axios';
import { 
  SportObject, 
  Reservation, 
  User, 
  ApiResponse, 
  AddObjectForm, 
  LoginForm, 
  RegisterForm,
  ObjectFilters 
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const objectsApi = {
  getObjects: (filters?: ObjectFilters): Promise<ApiResponse<SportObject[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    return api.get(`/objects?${params}`).then(res => res.data);
  },

  getObject: (id: number): Promise<ApiResponse<SportObject>> => {
    return api.get(`/objects/${id}`).then(res => res.data);
  },

  addObject: (object: AddObjectForm): Promise<ApiResponse<SportObject>> => {
    return api.post('/objects', object).then(res => res.data);
  },

  updateObject: (id: number, object: Partial<SportObject>): Promise<ApiResponse<SportObject>> => {
    return api.put(`/objects/${id}`, object).then(res => res.data);
  },

  deleteObject: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/objects/${id}`).then(res => res.data);
  },

  cancelReservation: (objectId: number, reservationId: number): Promise<ApiResponse<void>> => {
    return api.delete(`/objects/${objectId}/reservations/${reservationId}`).then(res => res.data);
  }
};

export const reservationsApi = {
  getReservations: (): Promise<ApiResponse<Reservation[]>> => {
    return api.get('/reservations').then(res => res.data);
  },

  getReservation: (id: number): Promise<ApiResponse<Reservation>> => {
    return api.get(`/reservations/${id}`).then(res => res.data);
  },

  createReservation: (reservation: {
    objectId: number;
    startTime: string;
    endTime: string;
  }): Promise<ApiResponse<Reservation>> => {
    return api.post('/reservations', reservation).then(res => res.data);
  },

  cancelReservation: (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/reservations/${id}`).then(res => res.data);
  }
};

export const authApi = {
  login: (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    return api.post('/auth/login', credentials).then(res => res.data);
  },

  register: (userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    return api.post('/auth/register', userData).then(res => res.data);
  },

  logout: (): Promise<ApiResponse<void>> => {
    return api.post('/auth/logout').then(res => res.data);
  },

  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return api.get('/auth/me').then(res => res.data);
  }
};

export const schedulesApi = {
  getObjectSchedule: (objectId: number, date?: string): Promise<ApiResponse<any>> => {
    const params = date ? `?date=${date}` : '';
    return api.get(`/schedules/objects/${objectId}${params}`).then(res => res.data);
  },

  getAvailableSlots: (objectId: number, date: string): Promise<ApiResponse<any[]>> => {
    return api.get(`/schedules/available/${objectId}?date=${date}`).then(res => res.data);
  }
};

export default api; 
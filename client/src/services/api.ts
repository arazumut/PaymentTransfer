import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Req/Res interceptor - token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth İşlemleri
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  initialBalance?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Token doğrulama
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Kullanıcı İşlemleri
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (name: string, balance: number) => {
  const response = await api.post('/users', { name, balance });
  return response.data;
};

// Transfer İşlemleri
export interface TransferData {
  senderId: number;
  receiverId: number;
  amount: number;
  description?: string;
  scheduledAt?: string;
}

export const createTransfer = async (data: TransferData, idempotencyKey?: string) => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
  
  const response = await api.post('/transfer', data, { headers });
  return response.data;
};

// İşlem Geçmişi
export const getTransactionHistory = async (userId: number) => {
  const response = await api.get(`/transactions?user_id=${userId}`);
  return response.data;
};

export default api; 
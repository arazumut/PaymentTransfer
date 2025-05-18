export interface User {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  senderId: number;
  receiverId: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    name: string;
  };
  receiver?: {
    id: number;
    name: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
} 
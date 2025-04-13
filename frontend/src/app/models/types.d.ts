import { Order } from './order';

export interface ServiceResponse {
  status: number;
  msg: string;
  data?: any;
}
export interface OrderResponse {
  success: boolean;
  order: Order;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface StatsResponse {
  success: boolean;
  income: number[];
}

export interface UserStatsResponse {
  _id: number;
  total: number;
}

export interface IncomeStatsResponse {
  _id: number;
  total: number; 
}

export interface OrderWithUsername extends Order {
  username?: string;
}
export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accessToken: string;
}

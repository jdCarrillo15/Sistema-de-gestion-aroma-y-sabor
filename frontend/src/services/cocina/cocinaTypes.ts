//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: string;
  table_name: string;
  items: OrderItem[];
  status: 'pending' | 'ready';
  created_at: string;
  order_number: number;
}

export interface Bill {
  id: string;
  table_name: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  duration: string;
}

export interface PaidBill extends Bill {
  payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  paid_at: string;
}
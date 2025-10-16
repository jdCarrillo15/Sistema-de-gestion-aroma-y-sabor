export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price?: number;
  process?: 'pending' | 'ready' | 'delivered';
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
  table_name: number;
  items: OrderItem[];
  total: number;
  created_at: string;
  duration: string;
}

export interface PaidBill extends Bill {
  payment_method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  paid_at: string;
}

export interface ActiveTable {
  id: string;
  table: string;
  time: string;
  duration: string;
  items: {
    name: string;
    price: number;
    units: number;
  }[];
  total: number;
}

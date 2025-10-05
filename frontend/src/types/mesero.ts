export interface Table {
  id: string;
  number: number;
  status: 'free' | 'occupied';
  capacity: number;
  current_bill_id: string | null;
}

export interface Bill {
  id: string;
  table_id: string;
  waiter_id: string;
  waiter_name?: string;
  state: 'open' | 'closed' | 'paid';
  total: number;
  created_at: Date | string;
  closed_at?: Date | string;
}

export interface Order {
  id: string;
  bill_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  created_at?: Date | string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
  stock: number;
  type: 'prepared' | 'nonprepared';
}

//cuando agregue category al productop
export interface ProductCategory {
  id: string;
  name: string;
}
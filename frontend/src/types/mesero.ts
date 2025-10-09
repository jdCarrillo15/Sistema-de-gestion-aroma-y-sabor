export interface Table {
  id: string;
  number: number;
  status?: 'free' | 'occupied';
  capacity: number;
  current_bill_id: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
  stock: number;
  type: 'prepared' | 'nonprepared';
}

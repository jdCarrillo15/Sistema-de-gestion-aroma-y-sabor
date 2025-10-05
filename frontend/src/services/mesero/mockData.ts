import { Table, Bill, Order } from '../../types/mesero';

//mesas
export const mockTables: Table[] = [
  { id: '1', number: 1, status: 'free', capacity: 4, current_bill_id: null },
  { id: '2', number: 2, status: 'occupied', capacity: 4, current_bill_id: 'bill1' },
  { id: '3', number: 3, status: 'free', capacity: 2, current_bill_id: null },
  { id: '4', number: 4, status: 'occupied', capacity: 6, current_bill_id: 'bill2' },
  { id: '5', number: 5, status: 'free', capacity: 4, current_bill_id: null },
  { id: '6', number: 6, status: 'free', capacity: 2, current_bill_id: null },
  { id: '7', number: 7, status: 'occupied', capacity: 4, current_bill_id: 'bill3' },
  { id: '8', number: 8, status: 'free', capacity: 4, current_bill_id: null },
];

//cuentas
export const mockBills: Bill[] = [
  {
    id: 'bill1',
    table_id: '2',
    waiter_id: 'waiter1',
    waiter_name: 'Carol',
    state: 'open',
    total: 11300,
    created_at: '2025-01-04T14:15:00',
  },
  {
    id: 'bill2',
    table_id: '4',
    waiter_id: 'waiter1',
    waiter_name: 'Carol',
    state: 'open',
    total: 5500,
    created_at: '2025-01-04T15:30:00',
  },
  {
    id: 'bill3',
    table_id: '7',
    waiter_id: 'waiter1',
    waiter_name: 'Carol',
    state: 'open',
    total: 12300,
    created_at: '2025-01-04T13:45:00',
  },
];

//ordenes
export const mockOrders: Order[] = [
  // Órdenes de Mesa 2 (Bill 1)
  {
    id: 'order1',
    bill_id: 'bill1',
    product_id: 'prod1',
    product_name: 'Café',
    product_price: 2500,
    quantity: 2,
    subtotal: 5000,
    status: 'delivered',
    created_at: '2025-01-04T14:16:00',
  },
  {
    id: 'order2',
    bill_id: 'bill1',
    product_id: 'prod2',
    product_name: 'Cappuccino',
    product_price: 3000,
    quantity: 1,
    subtotal: 3000,
    status: 'ready',
    created_at: '2025-01-04T14:20:00',
  },
  {
    id: 'order3',
    bill_id: 'bill1',
    product_id: 'prod3',
    product_name: 'Tinto',
    product_price: 1500,
    quantity: 2,
    subtotal: 3000,
    status: 'preparing',
    created_at: '2025-01-04T14:25:00',
  },

  {
    id: 'order4',
    bill_id: 'bill2',
    product_id: 'prod1',
    product_name: 'Café',
    product_price: 2500,
    quantity: 1,
    subtotal: 2500,
    status: 'delivered',
    created_at: '2025-01-04T15:31:00',
  },
  {
    id: 'order5',
    bill_id: 'bill2',
    product_id: 'prod4',
    product_name: 'Agua Aromática',
    product_price: 1800,
    quantity: 2,
    subtotal: 3600,
    status: 'pending',
    created_at: '2025-01-04T15:35:00',
  },


  {
    id: 'order6',
    bill_id: 'bill3',
    product_id: 'prod5',
    product_name: 'Café Americano',
    product_price: 2000,
    quantity: 2,
    subtotal: 4000,
    status: 'delivered',
    created_at: '2025-01-04T13:46:00',
  },
  {
    id: 'order7',
    bill_id: 'bill3',
    product_id: 'prod6',
    product_name: 'Águila Light',
    product_price: 3500,
    quantity: 2,
    subtotal: 7000,
    status: 'delivered',
    created_at: '2025-01-04T13:50:00',
  },
  {
    id: 'order8',
    bill_id: 'bill3',
    product_id: 'prod7',
    product_name: 'Poker',
    product_price: 3200,
    quantity: 1,
    subtotal: 3200,
    status: 'ready',
    created_at: '2025-01-04T14:00:00',
  },
];







export const getTableById = (tableId: string): Table | undefined => {
  return mockTables.find(t => t.id === tableId);
};

export const getBillById = (billId: string): Bill | undefined => {
  return mockBills.find(b => b.id === billId);
};

export const getOrdersByBillId = (billId: string): Order[] => {
  return mockOrders.filter(o => o.bill_id === billId);
};


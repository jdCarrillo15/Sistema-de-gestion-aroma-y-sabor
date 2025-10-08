// services/cocina/cocinaService.ts
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

export interface OrderResponse {
  orders: Order[];
}

export interface BillResponse {
  bills: Bill[];
}

export interface PaidBillResponse {
  paidBills: PaidBill[];
}


export async function getOrders(): Promise<OrderResponse> {
  try {
    console.log("Obteniendo pedidos...");
    
    /*
    const response = await fetch(`${API_BASE_URL}/orders/getorders`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo pedidos");
    }

    return await response.json();
    */
    return { orders: mockOrders };
  } catch (error) {
    console.error("Error in getOrders service:", error);
    throw error;
  }
}

export async function markOrderReady(orderId: string): Promise<{ message: string }> {
  try {
    console.log("Marcando pedido como listo:", orderId);
    
    /*
    const response = await fetch(`${API_BASE_URL}/orders/markready/${orderId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error marcando pedido como listo");
    }

    return await response.json();
    */

    return { message: "Pedido marcado como listo" };
  } catch (error) {
    console.error("Error in markOrderReady service:", error);
    throw error;
  }
}

export async function getActiveBills(): Promise<BillResponse> {
  try {
    console.log("Obteniendo cuentas activas...");
    
    /*
    const response = await fetch(`${API_BASE_URL}/bills/getactivebills`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo cuentas");
    }

    return await response.json();
    */

    return { bills: mockBills };
  } catch (error) {
    console.error("Error in getActiveBills service:", error);
    throw error;
  }
}

export async function payBill(billId: string, paymentMethod: string): Promise<{ message: string }> {
  try {
    console.log("Pagando cuenta:", billId, paymentMethod);
    
    /*
    const response = await fetch(`${API_BASE_URL}/bills/paybill/${billId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ payment_method: paymentMethod }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error procesando pago");
    }

    return await response.json();
    */

    return { message: "Pago procesado exitosamente" };
  } catch (error) {
    console.error("Error in payBill service:", error);
    throw error;
  }
}

export async function getPaidBills(): Promise<PaidBillResponse> {
  try {
    console.log("Obteniendo historial de pagos...");
        /*
    const response = await fetch(`${API_BASE_URL}/bills/getpaidbills`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo historial");
    }

    return await response.json();
    */

    return { paidBills: mockPaidBills };
  } catch (error) {
    console.error("Error in getPaidBills service:", error);
    throw error;
  }
}

export function handleApiError(error: any): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return "Error de conexión. Verifica que el servidor esté funcionando.";
  }
  
  if (error.message) {
    return error.message;
  }
  
  return "Ha ocurrido un error inesperado";
}

const mockOrders: Order[] = [
  {
    id: '1',
    table_name: 'Mesa 5',
    items: [
      { id: '1', product_name: 'Empanada Pollo', quantity: 1 },
      { id: '2', product_name: 'Café', quantity: 2 },
      { id: '3', product_name: 'Sandwichh', quantity: 1 }
    ],
    status: 'pending',
    created_at: '10:23',
    order_number: 1
  },
  {
    id: '2',
    table_name: 'Mesa 12',
    items: [
      { id: '4', product_name: 'Jugo Natural', quantity: 1 },
      { id: '5', product_name: 'Galletas', quantity: 1 }
    ],
    status: 'pending',
    created_at: '10:25',
    order_number: 2
  },
  {
    id: '3',
    table_name: 'Mesa 3',
    items: [
      { id: '6', product_name: 'Café', quantity: 1 },
      { id: '7', product_name: 'Tinto', quantity: 3 }
    ],
    status: 'pending',
    created_at: '10:28',
    order_number: 3
  },
  {
    id: '4',
    table_name: 'Llevar #45',
    items: [
      { id: '8', product_name: 'Empanada Pollo', quantity: 2 },
      { id: '9', product_name: 'Jugo Natural', quantity: 1 }
    ],
    status: 'pending',
    created_at: '10:30',
    order_number: 4
  },
  {
    id: '5',
    table_name: 'Mesa 8',
    items: [
      { id: '10', product_name: 'Sandwichh', quantity: 1 },
      { id: '11', product_name: 'Tinto', quantity: 1 }
    ],
    status: 'ready',
    created_at: '10:15',
    order_number: 0
  },
  {
    id: '6',
    table_name: 'Mesa 2',
    items: [
      { id: '12', product_name: 'Galletas', quantity: 2 },
      { id: '13', product_name: 'Café', quantity: 1 }
    ],
    status: 'ready',
    created_at: '10:18',
    order_number: 0
  }
];

const mockBills: Bill[] = [
  {
    id: '1',
    table_name: 'Mesa 5',
    items: [
      { id: '1', product_name: 'Empanada Pollo', quantity: 1, price: 3300 },
      { id: '2', product_name: 'Café', quantity: 2, price: 2500 }
    ],
    total: 8300,
    created_at: '10:23',
    duration: '15 min'
  },
  {
    id: '2',
    table_name: 'Mesa 12',
    items: [
      { id: '3', product_name: 'Jugo Natural', quantity: 1, price: 2000 },
      { id: '4', product_name: 'Galletas', quantity: 1, price: 1500 }
    ],
    total: 3500,
    created_at: '10:25',
    duration: '13 min'
  },
  {
    id: '3',
    table_name: 'Mesa 3',
    items: [
      { id: '5', product_name: 'Café', quantity: 1, price: 2500 },
      { id: '6', product_name: 'Tinto', quantity: 3, price: 2000 }
    ],
    total: 8500,
    created_at: '10:28',
    duration: '10 min'
  },
  {
    id: '4',
    table_name: 'Llevar #45',
    items: [
      { id: '7', product_name: 'Empanada Pollo', quantity: 2, price: 3300 },
      { id: '8', product_name: 'Jugo Natural', quantity: 1, price: 2000 }
    ],
    total: 8600,
    created_at: '10:30',
    duration: '8 min'
  }
];

const mockPaidBills: PaidBill[] = [
  {
    id: '101',
    table_name: 'Mesa 7',
    items: [
      { id: '14', product_name: 'Empanada Pollo', quantity: 2, price: 3300 },
      { id: '15', product_name: 'Café', quantity: 3, price: 2500 }
    ],
    total: 12500,
    created_at: '09:45',
    duration: '20 min',
    payment_method: 'Efectivo',
    paid_at: '09:45'
  },
  {
    id: '102',
    table_name: 'Mesa 1',
    items: [
      { id: '16', product_name: 'Jugo Natural', quantity: 2, price: 2000 },
      { id: '17', product_name: 'Tinto', quantity: 1, price: 1600 }
    ],
    total: 5600,
    created_at: '09:52',
    duration: '18 min',
    payment_method: 'Tarjeta',
    paid_at: '09:52'
  },
  {
    id: '103',
    table_name: 'Llevar #32',
    items: [
      { id: '18', product_name: 'Sandwichh', quantity: 2, price: 3000 },
      { id: '19', product_name: 'Café', quantity: 1, price: 2500 }
    ],
    total: 8900,
    created_at: '10:05',
    duration: '15 min',
    payment_method: 'Efectivo',
    paid_at: '10:05'
  },
  {
    id: '104',
    table_name: 'Mesa 9',
    items: [
      { id: '20', product_name: 'Empanada Pollo', quantity: 3, price: 3300 },
      { id: '21', product_name: 'Jugo Natural', quantity: 2, price: 2000 }
    ],
    total: 15200,
    created_at: '10:12',
    duration: '22 min',
    payment_method: 'Transferencia',
    paid_at: '10:12'
  }
];
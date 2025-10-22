//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface Product {
  id: string;
  name: string;
  process: 'pending' | 'ready' | 'delivered';
  units: number;
  price?: number;
}

export interface Bill {
  id: string;
  table: string;
  products: Product[];
  total: number;
  created_at: any;
  status: 'open' | 'closed' | 'paid';
  user_id: string;
  user?: {
    id: string;
    name?: string;
  };
  payment_method?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  paid_at?: any;
}

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

export interface BillResponse {
  bills: Bill[];
}

export interface OrderResponse {
  orders: Order[];
}


export async function getAllBills(): Promise<BillResponse> {
  try {
    console.log("Obteniendo todas las cuentas...");

    const response = await fetch(`${API_BASE_URL}/bills/getBills`, {
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
  } catch (error) {
    console.error("Error in getAllBills service:", error);
    throw error;
  }
}


export async function getActiveBills(): Promise<BillResponse> {
  try {
    console.log("Obteniendo cuentas activas...");

    const response = await getAllBills();

    const activeBills = response.bills.filter(
      (bill: Bill) => bill.status === 'open'
    );

    return { bills: activeBills };
  } catch (error) {
    console.error("Error in getActiveBills service:", error);
    throw error;
  }
}

export async function getOrders(): Promise<OrderResponse> {
  try {
    console.log("Obteniendo pedidos para cocina...");

    const response = await getActiveBills();

    const orders: Order[] = response.bills
      .filter(bill => bill.products && bill.products.length > 0)
      .map((bill, _index) => {
        // Asegurar que cada producto tenga process (si no existe, usar "pending")
        const items: OrderItem[] = bill.products.map(product => ({
          id: product.id,
          product_name: product.name,
          quantity: product.units,
          price: product.price,
          process: product.process || "pending",
        }));

        // Determinar si la orden completa está lista o pendiente
        const allReady = items.every(p => p.process === "ready" || p.process === "delivered");
        const status: "pending" | "ready" = allReady ? "ready" : "pending";

        // Calcular el orden de aparición solo entre pendientes
        const pendingIndex = response.bills
          .filter(b => b.products?.some(p => (p.process || "pending") === "pending"))
          .findIndex(b => b.id === bill.id);

        return {
          id: bill.id,
          table_name: bill.table,
          items,
          status,
          created_at: formatTime(bill.created_at),
          order_number: status === "pending" ? pendingIndex + 1 : 0,
        };
      })
      // Ordenar: pendientes primero, listos después
      .sort((a, b) => {
        if (a.status === "pending" && b.status === "ready") return -1;
        if (a.status === "ready" && b.status === "pending") return 1;
        return 0;
      });

    console.log(`${orders.length} pedidos obtenidos`);
    return { orders };
  } catch (error) {
    console.error("Error in getOrders service:", error);
    throw error;
  }
}


export async function markOrderReady(orderId: string): Promise<{ message: string }> {
  try {
    console.log(`Marcando pedido ${orderId} como listo...`);

    const billResponse = await fetch(`${API_BASE_URL}/bills/getBill/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!billResponse.ok) {
      throw new Error("Error obteniendo cuenta");
    }

    const bill: Bill = await billResponse.json();

    const updatedProducts = bill.products.map(product => ({
      ...product,
      process: 'ready' as const
    }));

    const response = await fetch(`${API_BASE_URL}/bills/updateProductsInBill/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ products: updatedProducts }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error marcando pedido como listo");
    }

    console.log(`Pedido ${orderId} marcado como listo`);
    return { message: "Pedido marcado como listo" };
  } catch (error) {
    console.error("Error in markOrderReady service:", error);
    throw error;
  }
}

export async function changeProductState(
  billId: string,
  productId: string,
  newState: 'pending' | 'ready' | 'delivered'
): Promise<{ message: string }> {
  try {
    if (!billId || !productId || !newState) {
      throw new Error("Parámetros inválidos para changeProductState");
    }

    console.debug("changeProductState payload:", { billId, productId, newState });

    const response = await fetch(`${API_BASE_URL}/bills/changeProductStateInBill/${billId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId,
        newState
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error cambiando estado del producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in changeProductState service:", error);
    throw error;
  }
}

export async function getBillById(billId: string): Promise<Bill> {
  try {
    console.log(`Obteniendo cuenta: ${billId}`);

    const response = await fetch(`${API_BASE_URL}/bills/getBill/${billId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo cuenta");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getBillById service:", error);
    throw error;
  }
}

export function calculateDuration(createdAt: any): string {
  try {
    let created: Date;

    if (createdAt && typeof createdAt === 'object' && createdAt._seconds) {
      created = new Date(createdAt._seconds * 1000);
    } else if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
      created = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === 'string') {
      created = new Date(createdAt);
    } else if (createdAt instanceof Date) {
      created = createdAt;
    } else {
      return "0 min";
    }

    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Ahora";
    } else if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  } catch (error) {
    console.error("Error calculando duración:", error);
    return "N/A";
  }
}

export function formatTime(timestamp: any): string {
  try {
    let date: Date;

    if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return "N/A";
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formateando hora:", error);
    return "N/A";
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
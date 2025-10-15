const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_BASE_URL = "http://localhost:3000";

export interface Bill {
  id: string;
  table: number;
  user_id: string;
  status: 'open' | 'closed';
  total: number;
  products: BillProduct[];
  created_at: any;
  user?: any;
}

export interface BillProduct {
  id: string;
  name: string;
  units: number;
  process: 'pending' | 'preparing' | 'ready' | 'finished';
}

// Obtener todas las cuentas
export async function getBills(): Promise<Bill[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/getBills`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al obtener cuentas");
    }

    const data = await response.json();
    return data.bills || [];
  } catch (error) {
    console.error("Error en getBills:", error);
    return [];
  }
}

export async function getBillById(id: string): Promise<Bill | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/getBill/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al obtener cuenta");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getBillById:", error);
    return null;
  }
}

export async function getActiveBills() {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/activeBills`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.bills || [];
  } catch (error) {
    console.error("Error obteniendo cuentas activas:", error);
    throw error;
  }
}

export async function createBill(tableNumber: number, userId: string): Promise<Bill | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/createBill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        table: tableNumber,
        user_id: userId,
        status: 'open',
        total: 0,
        products: []
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear cuenta");
    }

    const data = await response.json();
    const newBillId = data.id;
    const newBill = await getBillById(newBillId);

    return newBill || null;
  } catch (error) {
    console.error("Error en createBill:", error);
    throw error;
  }
}


export async function addProductToBill(
  billId: string,
  productId: string,
  productName: string,
  units: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/addProductToBill/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        products: [{
          id: productId,
          name: productName,
          units: units,
          process: 'pending'
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error del servidor:", errorData);
      throw new Error(errorData.error || "Error al agregar producto");
    }

    return true;
  } catch (error) {
    console.error("Error en addProductToBill:", error);
    throw error;
  }
}

export async function removeProductFromBill(
  billId: string,
  productId: string
): Promise<{ success: boolean; total: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/removeProductFromBill/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: productId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar producto");
    }

    const data = await response.json();
    return { success: true, total: data.total || 0 };
  } catch (error) {
    console.error("Error en removeProductFromBill:", error);
    throw error;
  }
}

/*
export async function updateProductStatus(
  billId: string,
  productId: string,
  newStatus: 'pending' | 'preparing' | 'ready' | 'finished'
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/changeProductStateInBill/${billId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: productId,
        newState: newStatus
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar estado");
    }

    return true;
  } catch (error) {
    console.error("Error en updateProductStatus:", error);
    throw error;
  }
}
*/

export async function updateProductsInBill(
  billId: string,
  products: BillProduct[]
): Promise<{ success: boolean; total: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/updateProductsInBill/${billId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        products: products
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar productos");
    }

    const data = await response.json();
    return { success: true, total: data.total || 0 };
  } catch (error) {
    console.error("Error en updateProductsInBill:", error);
    throw error;
  }
}


export async function closeBillIfEmpty(billId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/closeBillIfEmpty/${billId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al cerrar cuenta");
    }

    return true;
  } catch (error) {
    console.error("Error en closeBillIfEmpty:", error);
    throw error;
  }
}


export async function calculateBillTotal(billId: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/calculateBillTotal/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al calcular total");
    }

    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error("Error en calculateBillTotal:", error);
    throw error;
  }
}


export async function deleteBill(billId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/harddeleteBill/${billId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar cuenta");
    }

    return true;
  } catch (error) {
    console.error("Error en deleteBill:", error);
    throw error;
  }
}
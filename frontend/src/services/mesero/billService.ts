//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Bill {
  id: string;
  table: string;
  user_id: string;
  state: 'open' | 'closed';
  total: number;
  products: BillProduct[];  
  created_at: any;
  user?: any;
}

export interface BillProduct {
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

export async function createBill(tableNumber: string, userId: string): Promise<Bill | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/createBill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        table: tableNumber,
        user_id: userId,
        state: 'open',
        total: 0,
        products: [] 
      })
    });

    if (!response.ok) {
      throw new Error("Error al crear cuenta");
    }

    const data = await response.json();

  
    if (data.id) {
     
      await new Promise(resolve => setTimeout(resolve, 500));
      const newBill = await getBillById(data.id);
      return newBill;
    }

    // Fallback: buscar por tabla
    await new Promise(resolve => setTimeout(resolve, 500));
    const bills = await getBills();
    const newBill = bills.find(b => b.table === tableNumber && b.state === 'open');
    
    return newBill || null;
  } catch (error) {
    console.error("Error en createBill:", error);
    return null;
  }
}

export async function addProductToBill(
  billId: string, 
  productName: string, 
  units: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/addProductToBill/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product: {
          name: productName,
          units: units,
          process: 'pending'
        }
      })
    });

    if (!response.ok) {
      throw new Error("Error al agregar producto");
    }

    return true;
  } catch (error) {
    console.error("Error en addProductToBill:", error);
    return false;
  }
}

export async function removeProductFromBill(
  billId: string, 
  productIndex: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/removeProductFromBill/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productIndex: productIndex
      })
    });

    if (!response.ok) {
      throw new Error("Error al eliminar producto");
    }

    return true;
  } catch (error) {
    console.error("Error en removeProductFromBill:", error);
    return false;
  }
}
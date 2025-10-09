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
  id: string;  // ID del producto en Firestore
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
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear cuenta");
    }

    const data = await response.json();
    
    // Esperar un poco para que Firebase termine de guardar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar la cuenta recién creada
    const bills = await getBills();
    const newBill = bills.find(b => b.table === tableNumber && b.state === 'open');
    
    return newBill || null;
  } catch (error) {
    console.error("Error en createBill:", error);
    throw error;
  }
}

// CORRECCIÓN CRÍTICA: Enviar array de productos
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
        products: [{  //  ARRAY
          id: productId,  //ID del producto
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
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills/removeProductFromBill/${billId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: productId  // Enviar el ID del producto a eliminar
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar producto");
    }

    return true;
  } catch (error) {
    console.error("Error en removeProductFromBill:", error);
    throw error;
  }
}
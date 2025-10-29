const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ProductsSummary {
  [productName: string]: number;
}

export interface Shift {
  id: string;
  user_id: string;
  state: "open" | "closed";
  started_at: string;
  finished_at: string | null;
  total_bills: number;
  total_sales: number;
  products_summary: ProductsSummary;
}

export interface ShiftsResponse {
  shifts: Shift[];
}

/**
 * Obtiene todos los turnos del sistema
 */
export async function getShifts(): Promise<ShiftsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/shifts/getShifts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo turnos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getShifts service:", error);
    throw error;
  }
}

/**
 * Obtiene un turno específico por su ID
 */
export async function getShiftById(id: string): Promise<Shift> {
  try {
    const response = await fetch(`${API_BASE_URL}/shifts/getShift/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo turno");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getShiftById service:", error);
    throw error;
  }
}

/**
 * Manejo de errores de la API
 */
export function handleApiError(error: any): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return "Error de conexión. Verifica que el servidor esté funcionando.";
  }

  if (error.message) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado";
}
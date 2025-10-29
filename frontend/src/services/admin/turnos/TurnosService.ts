import { Turnos } from "./TurnosTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getTurnoss = async (): Promise<Turnos[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Turnoss`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Agregar token de autenticación si es necesario
        // "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los turnos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTurnoss:", error);
    throw error;
  }
};


export const getTurnossByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Turnos[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Turnoss?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los turnos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTurnossByDateRange:", error);
    throw error;
  }
};


export const saveTurnos = async (Turnos: Turnos): Promise<Turnos> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Turnoss`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Turnos),
    });

    if (!response.ok) {
      throw new Error("Error al guardar el turno");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en saveTurnos:", error);
    throw error;
  }
};


export const updateTurnos = async (
  TurnosId: string,
  Turnos: Partial<Turnos>
): Promise<Turnos> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Turnoss/${TurnosId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Turnos),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el turno");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en updateTurnos:", error);
    throw error;
  }
};


export const deleteTurnos = async (
  date: string,
  type: "morning" | "afternoon"
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Turnoss/${date}/${type}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el turno");
    }
  } catch (error) {
    console.error("Error en deleteTurnos:", error);
    throw error;
  }
};


export const getAvailableUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users?status=active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getAvailableUsers:", error);
    throw error;
  }
};
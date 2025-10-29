import { Turnos, User } from "./TurnosTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type BackendShift = {
  id: string;
  user_id: string | null;
  state: "open" | "closed";
  started_at: string | null;
  finished_at: string | null;
  total_bills: number;
  total_sales: number;
  products_summary: Record<string, number>;
};

type CreateShiftPayload = {
  user_id: string;
  state?: "open" | "closed";
  started_at?: string;
  finished_at?: string | null;
};


export const getTurnoss = async (): Promise<Turnos[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getShifts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los turnos");
    }

    const data = await response.json();
    
    return transformBackendShiftsToFrontend(data.shifts || []);
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
    const response = await fetch(`${API_BASE_URL}/getShifts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los turnos");
    }

    const data = await response.json();
    const shifts = transformBackendShiftsToFrontend(data.shifts || []);
    
    return shifts.filter(shift => {
      return shift.date >= startDate && shift.date <= endDate;
    });
  } catch (error) {
    console.error("Error en getTurnossByDateRange:", error);
    throw error;
  }
};


export const saveTurnos = async (turnos: Turnos): Promise<Turnos> => {
  try {
    if (turnos.assignments.length < 2) {
      throw new Error("Se requieren mínimo 2 usuarios asignados al turno");
    }

    const hasWaiter = turnos.assignments.some(a => a.role === "waiter");
    if (!hasWaiter) {
      throw new Error("Se requiere al menos un mesero en el turno");
    }

    const hasCashOrKitchen = turnos.assignments.some(
      a => a.role === "cash" || a.role === "kitchen"
    );
    if (!hasCashOrKitchen) {
      throw new Error("Se requiere al menos un cajero o cocinero en el turno");
    }

    const timeMap = {
      morning: "07:00:00",
      afternoon: "15:00:00"
    };
    
    const started_at = `${turnos.date}T${timeMap[turnos.type]}-05:00`;

    // Crear un turno por cada usuario asignado
    const createdShifts = await Promise.all(
      turnos.assignments.map(async (assignment) => {
        const payload: CreateShiftPayload = {
          user_id: assignment.userId,
          state: "open",
          started_at: started_at,
          finished_at: null
        };

        const response = await fetch(`${API_BASE_URL}/createShift`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear el turno");
        }

        return await response.json();
      })
    );

    console.log("Turnos creados:", createdShifts);
    return turnos;
  } catch (error) {
    console.error("Error en saveTurnos:", error);
    throw error;
  }
};


export const updateTurnos = async (
  turnosId: string,
  turnos: Partial<Turnos>
): Promise<Turnos> => {
  try {
    if (turnos.assignments && turnos.assignments.length > 0) {
      if (turnos.assignments.length < 2) {
        throw new Error("Se requieren mínimo 2 usuarios asignados al turno");
      }

      const hasWaiter = turnos.assignments.some(a => a.role === "waiter");
      const hasCashOrKitchen = turnos.assignments.some(
        a => a.role === "cash" || a.role === "kitchen"
      );

      if (!hasWaiter) {
        throw new Error("Se requiere al menos un mesero en el turno");
      }

      if (!hasCashOrKitchen) {
        throw new Error("Se requiere al menos un cajero o cocinero en el turno");
      }
    }

    const payload: any = {};
    
    if (turnos.date && turnos.type) {
      const timeMap = {
        morning: "06:00:00",
        afternoon: "14:00:00"
      };
      payload.started_at = `${turnos.date}T${timeMap[turnos.type]}-05:00`;
    }

    const response = await fetch(`${API_BASE_URL}/updateShift/${turnosId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar el turno");
    }

    return turnos as Turnos;
  } catch (error) {
    console.error("Error en updateTurnos:", error);
    throw error;
  }
};


export const deleteTurnos = async (turnosId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hardDeleteShift/${turnosId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar el turno");
    }
  } catch (error) {
    console.error("Error en deleteTurnos:", error);
    throw error;
  }
};


export const getAvailableUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getusers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    const data = await response.json();
    
    return (data.users || []).filter((user: any) => user.state === "active");
  } catch (error) {
    console.error("Error en getAvailableUsers:", error);
    throw error;
  }
};


export const getTurnosById = async (id: string): Promise<BackendShift> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getShift/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el turno");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getTurnosById:", error);
    throw error;
  }
};


export const closeTurnos = async (turnosId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/updateShift/${turnosId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: "closed"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al cerrar el turno");
    }
  } catch (error) {
    console.error("Error en closeTurnos:", error);
    throw error;
  }
};


function transformBackendShiftsToFrontend(backendShifts: BackendShift[]): Turnos[] {
  const groupedShifts = new Map<string, Turnos>();

  backendShifts.forEach((shift) => {
    if (!shift.started_at) return;

    const date = shift.started_at.split("T")[0];
    const hour = parseInt(shift.started_at.split("T")[1].split(":")[0]);
    
    const type: "morning" | "afternoon" = hour < 15 ? "morning" : "afternoon";
    const key = `${date}-${type}`;

    if (!groupedShifts.has(key)) {
      groupedShifts.set(key, {
        date,
        type,
        assignments: []
      });
    }

    const turnos = groupedShifts.get(key)!;
    if (shift.user_id) {
      turnos.assignments.push({
        userId: shift.user_id,
        userName: "Usuario", // Necesitarías hacer una consulta adicional
        role: "waiter" // Necesitarías obtener el rol real del usuario
      });
    }
  });

  return Array.from(groupedShifts.values());
}
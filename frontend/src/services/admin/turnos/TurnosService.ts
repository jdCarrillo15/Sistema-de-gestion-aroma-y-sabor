const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type ShiftType = "morning" | "afternoon";
export type Role = "waiter" | "cash" | "kitchen";

export interface ShiftAssignment {
  userId: string;
  userName: string;
  role: Role;
}

export interface Shift {
  id?: string;
  date: string;
  type: ShiftType;
  assignments: ShiftAssignment[];
}

interface BackendShift {
  id?: string;
  user_id: string;
  state: string;
  started_at: string;
  finished_at: string;
  total_bills?: number;
  total_sales?: number;
  products_summary?: any;
}

const SHIFT_TIMES = {
  morning: {
    start: "07:00:00",
    end: "14:00:00"
  },
  afternoon: {
    start: "14:00:00",
    end: "22:00:00"
  }
};


const toISOString = (date: string, time: string): string => {
  return `${date}T${time}-05:00`; 
};


const parseTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";
    if (typeof timestamp === "string") return timestamp;
  
  if (timestamp._seconds !== undefined) {
    const date = new Date(timestamp._seconds * 1000);
    return date.toISOString();
  }
  
  if (timestamp.seconds !== undefined) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString();
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  return "";
};


export const getShifts = async (): Promise<Shift[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shifts/getShifts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al obtener los turnos");
    }

    const data = await response.json();
    const backendShifts: BackendShift[] = data?.shifts || [];

    const groupedShifts = new Map<string, Shift>();

    backendShifts.forEach((shift) => {
      if (!shift.started_at) return;

      const startedAtStr = parseTimestamp(shift.started_at);
      if (!startedAtStr) return;

      const date = startedAtStr.split('T')[0];
      
      const startTime = startedAtStr.split('T')[1]?.substring(0, 5) || "07:00";
      const type: ShiftType = startTime < "14:00" ? "morning" : "afternoon";

      const key = `${date}-${type}`;

      if (!groupedShifts.has(key)) {
        groupedShifts.set(key, {
          id: shift.id,
          date,
          type,
          assignments: []
        });
      }

      const groupedShift = groupedShifts.get(key)!;
      groupedShift.assignments.push({
        userId: shift.user_id,
        userName: shift.user_id,
        role: "waiter"
      });
    });

    return Array.from(groupedShifts.values());
  } catch (error) {
    console.error("Error en getShifts:", error);
    throw new Error("Error al obtener los turnos");
  }
};


export const createShift = async (shift: Shift): Promise<Shift> => {
  try {
    const { date, type, assignments } = shift;
    const times = SHIFT_TIMES[type];

    const createPromises = assignments.map(async (assignment) => {
      const backendShift = {
        user_id: assignment.userId,
        state: "open",
        started_at: toISOString(date, times.start),
        finished_at: toISOString(date, times.end)
      };

      const response = await fetch(`${API_BASE_URL}/shifts/createShift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(backendShift),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el turno");
      }

      return await response.json();
    });

    await Promise.all(createPromises);

    return shift;
  } catch (error) {
    console.error("Error en createShift:", error);
    throw error;
  }
};


export const updateShift = async (
  _id: string,
  shift: Partial<Shift>
): Promise<void> => {
  try {
    const allShifts = await getShifts();
    const existingShift = allShifts.find(s => 
      s.date === shift.date && s.type === shift.type
    );

    if (existingShift) {
      const response = await fetch(`${API_BASE_URL}/shifts/getShifts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      const backendShifts: BackendShift[] = data?.shifts || [];

      const date = shift.date!;
      const type = shift.type!;
      const times = SHIFT_TIMES[type];
      const startTimePrefix = toISOString(date, times.start).split('T')[1].substring(0, 5);

      const shiftsToDelete = backendShifts.filter(s => {
        if (!s.started_at) return false;
        const shiftDate = s.started_at.split('T')[0];
        const shiftTime = s.started_at.split('T')[1]?.substring(0, 5) || "";
        return shiftDate === date && shiftTime === startTimePrefix;
      });

      for (const shiftToDelete of shiftsToDelete) {
        if (shiftToDelete.id) {
          await fetch(`${API_BASE_URL}/shifts/hardDeleteShift/${shiftToDelete.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
        }
      }
    }

    if (shift.assignments && shift.date && shift.type) {
      await createShift({
        date: shift.date,
        type: shift.type,
        assignments: shift.assignments
      });
    }
  } catch (error) {
    console.error("Error en updateShift:", error);
    throw error;
  }
};


export const deleteShift = async (date: string, type: ShiftType): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shifts/getShifts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();
    const backendShifts: BackendShift[] = data?.shifts || [];

    const times = SHIFT_TIMES[type];
    const startTimePrefix = toISOString(date, times.start).split('T')[1].substring(0, 5);

    const shiftsToDelete = backendShifts.filter(s => {
      if (!s.started_at) return false;
      const shiftDate = s.started_at.split('T')[0];
      const shiftTime = s.started_at.split('T')[1]?.substring(0, 5) || "";
      return shiftDate === date && shiftTime === startTimePrefix;
    });

      for (const shift of shiftsToDelete) {
      if (shift.id) {
        await fetch(`${API_BASE_URL}/shifts/hardDeleteShift/${shift.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
    }
  } catch (error) {
    console.error("Error en deleteShift:", error);
    throw error;
  }
};
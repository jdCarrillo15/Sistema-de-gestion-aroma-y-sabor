export type TurnosTypes = "morning" | "afternoon";

export type Role = "waiter" | "admin" | "cash" | "kitchen";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
};

export type Assignment = {
  userId: string;
  userName: string;
  role: Role;
};

export type Turnos = {
  date: string;
  type: TurnosTypes;
  assignments: Assignment[];
};

export const ROLE_LABELS: Record<Role, string> = {
  waiter: "Mesero",
  admin: "Administrador",
  cash: "Cajero",
  kitchen: "Cocina"
};

export const Turnos_LABELS: Record<TurnosTypes, { name: string; time: string }> = {
  morning: {
    name: "Turno Mañana",
    time: "6:00 AM - 2:00 PM"
  },
  afternoon: {
    name: "Turno Tarde",
    time: "2:00 PM - 10:00 PM"
  }
};
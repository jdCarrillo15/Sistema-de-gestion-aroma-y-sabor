const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  current_bill_id: string | null;
  created_at?: string;
}

export async function getTables(): Promise<{ tables: Table[] }> {
  const res = await fetch(`${API_BASE_URL}/tables/getTables`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error obteniendo mesas");
  return await res.json();
}

export async function createTable(data: { number: number; capacity: number }) {
  const res = await fetch(`${API_BASE_URL}/tables/createTable`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creando mesa");
  return await res.json();
}

export async function updateTable(id: string, data: Partial<Table>) {
  const res = await fetch(`${API_BASE_URL}/tables/updateTable/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando mesa");
  return await res.json();
}

export async function deleteTable(id: string) {
  const res = await fetch(`${API_BASE_URL}/tables/deleteTable/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error eliminando mesa");
  return await res.json();
}
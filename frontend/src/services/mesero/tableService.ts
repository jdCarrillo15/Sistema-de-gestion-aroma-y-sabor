// src/services/mesero/tableService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { Table } from "../../types/mesero";


export async function getTables(): Promise<Table[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/tables/getTables`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!res.ok) throw new Error("Error al obtener mesas");

        const data = await res.json();
        return data.tables as Table[];
    } catch (err) {
        console.error("Error en getTables:", err);
        return [];
    }
}

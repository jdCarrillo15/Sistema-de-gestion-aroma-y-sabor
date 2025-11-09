const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: "free" | "occupied";
    current_bill_id: string | null;
    created_at?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    status: "active" | "inactive";
    stock: number;
    type: "prepared" | "nonprepared";
    created_at?: string;
}

export interface User {
    id: string;
    user_name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    person?: {
        id?: string;
        first_name: string;
        last_name: string;
        birthdate: string;
        document_id: string;
    };
}

export interface Sale {
    id: string;
    total: number;
    created_at: string;
    status: string;
}

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

// Interface para las estadísticas del dashboard
export interface DashboardStatsResponse {
    totalProducts: number;
    totalUsers: number;
    totalSalesToday: number;
    totalTables: number;
}

export interface UserResponse {
    id: string;
    user_name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    person?: {
        id?: string;
        first_name: string;
        last_name: string;
        birthdate: string;
        document_id: string;
    };
}

/*
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/getstats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error obteniendo estadísticas del dashboard");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in getDashboardStats service:", error);
        throw error;
    }
}
*/
export async function getTables(): Promise<{ tables: Table[] }> {
    try {
        const res = await fetch(`${API_BASE_URL}/tables/getTables`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        console.log("getTables response status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("getTables error response:", errorText);
            throw new Error(`Error obteniendo mesas: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("getTables data:", data);
        return data;
    } catch (error) {
        console.error("getTables catch error:", error);
        throw error;
    }
}

export async function getProducts(): Promise<{ products: Product[] }> {
    try {
        const response = await fetch(`${API_BASE_URL}/products/getproducts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error obteniendo productos");
        }

        const data = await response.json();
        console.log("Products data received:", data);
        return data;
    } catch (error) {
        console.error("Error in getProducts service:", error);
        throw error;
    }
}

/**
 * Obtiene todos los usuarios
 */
export async function getUsers(): Promise<{ users: UserResponse[] }> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/getusers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(errorData.error || "Error obteniendo usuarios");
        }

        const data = await response.json();
        console.log("Users data received:", data);

        return data;
    } catch (error) {
        console.error("Error in getUsers service:", error);
        throw error;
    }
}

/**
 * Obtiene todos los turnos del sistema
 */
export async function getShifts(): Promise<{ shifts: Shift[] }> {
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
 * Obtiene las ventas del día actual calculadas desde los turnos
 */
export async function getTodaySales(): Promise<number> {
    try {
        const shiftsResponse = await getShifts();
        const shifts = shiftsResponse.shifts || [];
        
        // Obtener la fecha de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filtrar turnos del día actual y sumar ventas
        const todayTotal = shifts
            .filter(shift => {
                try {
                    let shiftDate: Date;
                    
                    // Manejar diferentes formatos de fecha
                    if (shift.started_at && typeof shift.started_at === 'object' && '_seconds' in (shift.started_at as any)) {
                        shiftDate = new Date((shift.started_at as any)._seconds * 1000);
                    } else if (typeof shift.started_at === 'string') {
                        shiftDate = new Date(shift.started_at);
                    } else {
                        return false;
                    }
                    
                    shiftDate.setHours(0, 0, 0, 0);
                    return shiftDate.getTime() === today.getTime();
                } catch {
                    return false;
                }
            })
            .reduce((sum, shift) => sum + shift.total_sales, 0);
        
        console.log("Ventas del día calculadas:", todayTotal);
        return todayTotal;
    } catch (error) {
        console.error("Error in getTodaySales service:", error);
        return 0;
    }
}

/**
 * Calcula las estadísticas del dashboard desde los servicios individuales
 */
export async function calculateDashboardStats(): Promise<DashboardStatsResponse> {
    try {
        console.log("=== Calculando estadísticas del dashboard ===");

        const [tablesResult, productsResult, usersResult, salesResult] = await Promise.allSettled([
            getTables(),
            getProducts(),
            getUsers(),
            getTodaySales(),
        ]);

        console.log("Results:", {
            tables: tablesResult.status,
            products: productsResult.status,
            users: usersResult.status,
            sales: salesResult.status,
        });

        let totalTables = 0;
        if (tablesResult.status === "fulfilled") {
            const tablesData = tablesResult.value;
            console.log("tablesData:", tablesData);
            const tables = Array.isArray(tablesData) ? tablesData : (tablesData?.tables || []);
            console.log("Array de tables:", tables);
            totalTables = tables.length;
            console.log("Total mesas:", totalTables);
        } else {
            console.error("Error obteniendo mesas:", tablesResult.reason);
            console.warn("Continuando con totalTables = 0");
        }

        let totalProducts = 0;
        if (productsResult.status === "fulfilled") {
            const productsData = productsResult.value;
            const products = Array.isArray(productsData) ? productsData : (productsData?.products || []);
            totalProducts = products.length;
            console.log("Total productos:", totalProducts);
        } else {
            console.error(" Error obteniendo productos:", productsResult.reason);
            console.warn(" Continuando con totalProducts = 0");
        }

        let totalUsers = 0;
        if (usersResult.status === "fulfilled") {
            const usersData = usersResult.value;
            const users = Array.isArray(usersData) ? usersData : (usersData?.users || []);
            totalUsers = users.length;
            console.log("Total usuarios:", totalUsers);
        } else {
            console.error("Error obteniendo usuarios:", usersResult.reason);
            console.warn(" Continuando con totalUsers = 0");
        }

        let totalSalesToday = 0;
        if (salesResult.status === "fulfilled") {
            totalSalesToday = salesResult.value || 0;
            console.log(" Ventas del día:", totalSalesToday);
        } else {
            console.error("Error obteniendo ventas:", salesResult.reason);
            console.warn("Continuando con totalSalesToday = 0");
        }

        const stats = {
            totalProducts,
            totalUsers,
            totalSalesToday,
            totalTables,
        };

        console.log("=== Estadísticas calculadas ===", stats);
        return stats;
    } catch (error) {
        console.error("Error in calculateDashboardStats service:", error);
        throw error;
    }
}

/**
 * Obtiene las estadísticas del dashboard con fallback automático
 */
export async function getDashboardStatsWithFallback(): Promise<DashboardStatsResponse> {
    try {
        
        const stats = await calculateDashboardStats();
        return stats;
        
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        
        
        console.warn("Retornando valores por defecto");
        return {
            totalProducts: 0,
            totalUsers: 0,
            totalSalesToday: 0,
            totalTables: 0,
        };
    }
}

/**
 * Maneja errores de API de forma consistente
 */
export function handleApiError(error: any): string {
    if (error instanceof TypeError && error.message.includes("fetch")) {
        return "Error de conexión. Verifica que el servidor esté funcionando.";
    }

    if (error.message) {
        return error.message;
    }

    return "Ha ocurrido un error inesperado";
}
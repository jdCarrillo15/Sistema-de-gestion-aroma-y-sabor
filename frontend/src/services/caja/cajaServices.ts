//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface Product {
    id: string;
    name: string;
    process: 'pending' | 'ready' | 'delivered';
    units: number;
    price?: number;
}

export interface Bill {
    id: string;
    table: string;
    products: Product[];
    total: number;
    created_at: any;
    status: 'open' | 'closed' | 'paid';
    user_id: string;
    user?: {
        id: string;
        name?: string;
    };
    payment_method?: 'Efectivo' | 'Tarjeta' | 'Transferencia';
    paid_at?: any;
}

export interface BillsResponse {
    bills: Bill[];
}

export interface UpdateBillResponse {
    message: string;
}

export async function getAllBills(): Promise<BillsResponse> {
    try {
        console.log(" Obteniendo todas las cuentas...");

        const response = await fetch(`${API_BASE_URL}/bills/getBills`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error obteniendo cuentas");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in getAllBills service:", error);
        throw error;
    }
}


export async function getActiveBills(): Promise<BillsResponse> {
    try {
        console.log("Obteniendo cuentas activas...");

        const response = await getAllBills();

        const activeBills = response.bills.filter(
            (bill: Bill) => bill.status === 'open'
        );

        console.log(`${activeBills.length} cuentas activas encontradas`);
        return { bills: activeBills };
    } catch (error) {
        console.error(" Error in getActiveBills service:", error);
        throw error;
    }
}


export async function getBillById(billId: string): Promise<Bill> {
    try {
        console.log(`Obteniendo cuenta: ${billId}`);

        const response = await fetch(`${API_BASE_URL}/getproduct/:id/${billId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error obteniendo cuenta");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in getBillById service:", error);
        throw error;
    }
}


export async function payBill(
    billId: string,
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia'
): Promise<UpdateBillResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/bills/updateBill/${billId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: 'paid',
                payment_method: paymentMethod,
                paid_at: new Date().toISOString()
            }),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error procesando pago");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in payBill service:", error);
        throw error;
    }
}


export async function getPaidBills(): Promise<BillsResponse> {
    try {
        console.log("Obteniendo historial de pagos...");

        const response = await getAllBills();

        const paidBills = response.bills.filter(
            (bill: Bill) => bill.status === 'paid'
        );

        console.log(`${paidBills.length} cuentas pagadas encontradas`);
        return { bills: paidBills };
    } catch (error) {
        console.error("Error in getPaidBills service:", error);
        throw error;
    }
}


export async function updateBill(
    billId: string,
    data: Partial<Bill>
): Promise<UpdateBillResponse> {
    try {
        console.log(`Actualizando cuenta ${billId}:`, data);

        const response = await fetch(`${API_BASE_URL}/bills/updateBill/${billId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error actualizando cuenta");
        }

        console.log(`Cuenta ${billId} actualizada`);
        return await response.json();
    } catch (error) {
        console.error("Error in updateBill service:", error);
        throw error;
    }
}


export function calculateDuration(createdAt: any): string {
    try {
        let created: Date;

        if (createdAt && typeof createdAt === 'object' && createdAt._seconds) {
            created = new Date(createdAt._seconds * 1000);
        } else if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
            created = new Date(createdAt.seconds * 1000);
        } else if (typeof createdAt === 'string') {
            created = new Date(createdAt);
        } else if (createdAt instanceof Date) {
            created = createdAt;
        } else {
            return "0 min";
        }

        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) {
            return "Ahora";
        } else if (diffMins < 60) {
            return `${diffMins} min`;
        } else {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hours}h ${mins}m`;
        }
    } catch (error) {
        console.error("Error calculando duración:", error);
        return "N/A";
    }
}


export function formatTime(timestamp: any): string {
    try {
        let date: Date;

        if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return "N/A";
        }

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error("Error formateando hora:", error);
        return "N/A";
    }
}


export function getProductTotalPrice(product: Product): number {
    return (product.price || 1) * product.units;
}


export function handleApiError(error: any): string {
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return "Error de conexión. Verifica que el servidor esté funcionando.";
    }

    if (error.message) {
        return error.message;
    }

    return "Ha ocurrido un error inesperado";
}


export function formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CO')}`;
}


export function getProductUnitPrice(product: Product, _billTotal: number, _allProducts: Product[]): number {
    if (product.price && product.price > 0) {
        return product.price;
    }
    return 0;
}
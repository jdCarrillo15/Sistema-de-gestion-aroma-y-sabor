//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Product {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
  stock: number;
  type: 'prepared' | 'nonprepared';
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/getproducts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }

    const data = await response.json();
    
    const productsArray = data.products || [];
    

    const activeProducts = productsArray.filter((p: any) => 
      p.status === 'active' && 
      p.name && 
      p.price
    ).map((p: any) => ({
      ...p,
      price: typeof p.price === 'string' ? parseInt(p.price) : p.price,
      stock: typeof p.stock === 'string' ? parseInt(p.stock) : p.stock,
    }));
    
    
    return activeProducts;
  } catch (error) {
    console.error("Error en getProducts:", error);
    return [];
  }
}
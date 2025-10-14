//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateProductRequest {
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  status?: "active" | "inactive";
  stock?: number;
  type?: "prepared" | "nonprepared";
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
  created_at?: string;
}

export async function createProduct(product: CreateProductRequest): Promise<{ message: string }> {
  console.log("Creating product:", product);
  try {
    const response = await fetch(`${API_BASE_URL}/products/createproduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error creando producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createProduct service:", error);
    throw error;
  }
}

export async function getProducts(): Promise<{ products: ProductResponse[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/getproducts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo productos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getProducts service:", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<ProductResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/getproduct/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getProductById service:", error);
    throw error;
  }
}

export async function updateProductById(id: string, productData: UpdateProductRequest): Promise<{ message: string }> {
  console.log("Updating product:", id, productData);
  try {
    const response = await fetch(`${API_BASE_URL}/products/updateproduct/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error actualizando producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateProductById service:", error);
    throw error;
  }
}

export async function hardDeleteProduct(id: string): Promise<{ message: string }> {
  console.log("Deleting product:", id);
  try {
    const response = await fetch(`${API_BASE_URL}/products/harddeleteproduct/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error eliminando producto");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in hardDeleteProduct service:", error);
    throw error;
  }
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
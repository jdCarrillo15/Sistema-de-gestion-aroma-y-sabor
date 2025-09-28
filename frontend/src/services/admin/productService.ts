import { data } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export async function createProduct(product: any) {
  console.log("Creating product:", product);
  try {
    const response = await fetch(`${API_BASE_URL}/products/createproduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error creando usuario");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
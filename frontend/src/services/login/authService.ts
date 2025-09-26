//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = "http://localhost:3000";
import { getCookieUser } from "../admin/userService";

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error en las credenciales");
    }

    const data = await response.json();
    const setCookie = await response.headers.get('set-cookie');
   // getCookieUser(setCookie);
    console.log("Cookie in authService:", setCookie);
    console.log(document.cookie);
    return data;
  } catch (error) {
    throw error;
  }
}



export async function sendRecoveryEmail(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Error al solicitar recuperación");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

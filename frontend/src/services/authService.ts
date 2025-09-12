const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginUser(email: string, password: string) {
  console.log("Intentando logear con:", { email, password });
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Error en las credenciales");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export async function sendRecoveryEmail(email: string) {
  console.log("Enviando recuperación a:", email);
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
    console.error("Error en recuperación:", error);
    throw error;
  }
}

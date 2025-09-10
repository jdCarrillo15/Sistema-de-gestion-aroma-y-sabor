export async function loginUser(email: string, password: string) {
    console.log("Intentando logear con:", { email, password });
  try {
    const response = await fetch("http://localhost:8080/auth/login", {
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
    const response = await fetch("http://localhost:8080/api/auth/reset-password", {
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

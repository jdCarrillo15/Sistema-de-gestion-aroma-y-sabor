//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (!data.success) {
      return false; // Retorna false para credenciales incorrectas
    }
    if (data.success) {
      localStorage.setItem("user", JSON.stringify({
        uid: data.uid,
        role: data.role,
        name: data.name,
        email: email,
      }));
    }

    return data;
  } catch (error) {
    console.error("Error de conexión:", error);
    throw new Error("No se pudo conectar con el servidor");
  }
}

export async function sendRecoveryEmail(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export function getCurrentUser() {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}


export function isWaiter(): boolean {
  const user = getCurrentUser();
  return user?.role === "waiter";
}


export function isMesero(): boolean {
  return isWaiter();
}

export function isCocina(): boolean {
  const user = getCurrentUser();
  return user?.role === "kitchen";
}

export function isCaja(): boolean {
  const user = getCurrentUser();
  return user?.role === "cash";
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function logoutUser() {
  localStorage.removeItem("user");
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    await response.json();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}
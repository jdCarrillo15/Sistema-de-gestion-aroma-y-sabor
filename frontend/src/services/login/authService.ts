// frontend/src/services/login/authService.ts

const API_BASE_URL = "http://localhost:3000";

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error en las credenciales");
    }

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify({
        uid: data.uid,
        role: data.role,
        email: email
      }));
    }

    return data;
  } catch (error) {
    throw error;
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
  return user?.role === "caja"; 
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function logoutUser() {
  localStorage.removeItem("user");
}
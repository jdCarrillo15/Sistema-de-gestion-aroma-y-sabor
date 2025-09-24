const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Crear usuario
export async function createUser(user: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Error creando usuario");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Obtener lista de usuarios
export async function getUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error("Error obteniendo usuarios");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Actualizar usuario
export async function updateUser(userId: string, updatedUser: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      throw new Error("Error actualizando usuario");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Eliminar usuario
export async function deleteUser(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error eliminando usuario");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

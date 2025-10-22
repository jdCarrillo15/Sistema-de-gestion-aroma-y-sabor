//const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateUserRequest {
  user_name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  document_id: string;
}

export interface UpdateUserRequest {
  user_name?: string;
  email?: string;
  role?: string;
  status?: string;
  person_id?: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  document_id?: string;
}

export interface UserResponse {
  id: string;
  user_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  person?: {
    id?: string;
    first_name: string;
    last_name: string;
    birthdate: string;
    document_id: string;
  };
}

export async function createUser(userData: CreateUserRequest): Promise<{ message: string; userId: string }> {
  console.log("Creating user:", userData);
  try {
    const response = await fetch(`${API_BASE_URL}/users/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error creando usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createUser service:", error);
    throw error;
  }
}

export async function getUsers(): Promise<{ users: UserResponse[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/getusers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(errorData.error || "Error obteniendo usuarios");
    }

    const data = await response.json();
    console.log("Users data received:", data);

    return data;
  } catch (error) {
    console.error("Error in getUsers service:", error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/getuser/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error obteniendo usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getUserById service:", error);
    throw error;
  }
}

export async function updateUser(id: string, userData: UpdateUserRequest): Promise<{ message: string }> {
  console.log("Updating user:", id, userData);
  try {
    const response = await fetch(`${API_BASE_URL}/users/updateuser/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error actualizando usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateUser service:", error);
    throw error;
  }
}

export async function changeUserState(id: string, status: string): Promise<{ message: string }> {
  console.log("Changing user state:", id, status);
  try {
    const response = await fetch(`${API_BASE_URL}/users/changeState/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: status }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error cambiando estado del usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in changeUserState service:", error);
    throw error;
  }
}

export async function hardDeleteUser(id: string): Promise<{ message: string }> {
  console.log("Deleting user:", id);
  try {
    const response = await fetch(`${API_BASE_URL}/users/harddeleteuser/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error eliminando usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in hardDeleteUser service:", error);
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
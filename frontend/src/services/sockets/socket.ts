import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = "http://localhost:3000";
//const SOCKET_URL = "https://cafearomaysabor.com";

declare global {
  interface Window {
    __socket?: Socket;
  }
}

/**
 * Se crea la conexión al socket si no existe.
 * Si ya hay una conexión previa, reutiliza la existente.
 */
export function connectSocket(): Socket {
  if (!window.__socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Conectado al servidor:", socket?.id);
      const userData = localStorage.getItem("user");
      if (userData) {
        const { role, email, name } = JSON.parse(userData);
        socket?.emit("joinRole", { role, name: name || email });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket?.id);
    });

    window.__socket = socket;
    // ensure module-level `socket` points to the same instance
    socket = window.__socket;
  } else {
    console.log("Reusando socket existente:", window.__socket.id);
    const userData = localStorage.getItem("user");
    if (userData) {
      const { role, email, name } = JSON.parse(userData);
      window.__socket.emit("joinRole", { role, name: name || email });
    }
  }

  if (!socket && window.__socket) socket = window.__socket;
  return window.__socket as Socket;
}

/**
 * Obtiene la instancia actual del socket.
 * Lanza error si no está conectado.
 */
export function getSocket(): Socket {
  // Prefer the module-scoped socket, but fall back to window.__socket
  const current = socket || window.__socket;
  if (!current) {
    throw new Error("Socket no inicializado. Usar primero connectSocket().");
  }
  return current as Socket;
}

/**
 * Cierra la conexión del socket 
 */
export function disconnectSocket() {
  // Prefer the module-level socket, but fall back to the global window.__socket
  const current = socket || window.__socket;
  if (current) {
    try {
      current.disconnect();
    } catch (err) {
      console.warn("Error while disconnecting socket:", err);
    }
  }

  // Clear both references so future connectSocket() creates a fresh connection
  socket = null;
  try {
    if (window.__socket) delete window.__socket;
  } catch (err) {
    // fallback: set to undefined
    // @ts-ignore
    window.__socket = undefined;
  }
}
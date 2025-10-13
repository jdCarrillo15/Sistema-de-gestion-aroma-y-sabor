import React, { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "../services/sockets/socket";
import { useUser } from "./userContext";

type ConnectedUser = {
    socketId: string;
    role?: string;
    name?: string;
    timestamp?: string;
    [key: string]: unknown;
};

type SocketContextType = {
    socket: Socket | null;
    connectedUsers: ConnectedUser[];
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: React.PropsWithChildren) {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

    useEffect(() => {
        if (!user?.role) return;

        const newSocket = connectSocket();
        setSocket(newSocket);

        // Handler: recibe un solo nuevo usuario conectado
        const handleNuevo = (data: ConnectedUser) => {
            setConnectedUsers((prev) => {
                // evitar duplicados por socketId
                if (prev.some((u) => u.socketId === data.socketId)) return prev;
                return [...prev, data];
            });
        };

        // Handler: usuario desconectado
        const handleDesconectado = (data: { socketId: string }) => {
            setConnectedUsers((prev) => prev.filter((u) => u.socketId !== data.socketId));
        };

        // Handler: lista completa enviada por el servidor (inicial)
        const handleLista = (list: ConnectedUser[]) => {
            if (Array.isArray(list)) {
                setConnectedUsers(list);
            }
        };

        // Al reconectar pedir la lista actual de usuarios conectados
        const handleOnConnect = () => {
            // nombres de evento distintos por compatibilidad con distintos backends
            newSocket.emit("getConnectedUsers");
            newSocket.emit("requestConnectedUsers");
            newSocket.emit("solicitarUsuariosConectados");
        };

        newSocket.on("connect", handleOnConnect);
        newSocket.on("nuevoUsuarioConectado", handleNuevo);
        newSocket.on("usuarioDesconectado", handleDesconectado);

        // escuchar lista completa (varios posibles nombres)
        newSocket.on("connectedUsers", handleLista);
        newSocket.on("connected_users", handleLista);
        newSocket.on("usuariosConectados", handleLista);
        newSocket.on("usuarios_actuales", handleLista);

        // limpiar lista cuando el socket se desconecta
        const handleDisconnect = () => {
            setConnectedUsers([]);
        };

        newSocket.on("disconnect", handleDisconnect);

        return () => {
            newSocket.off("connect", handleOnConnect);
            newSocket.off("nuevoUsuarioConectado", handleNuevo);
            newSocket.off("usuarioDesconectado", handleDesconectado);

            newSocket.off("connectedUsers", handleLista);
            newSocket.off("connected_users", handleLista);
            newSocket.off("usuariosConectados", handleLista);
            newSocket.off("usuarios_actuales", handleLista);

            newSocket.off("disconnect", handleDisconnect);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connectedUsers }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): SocketContextType {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
}

export { useUser };
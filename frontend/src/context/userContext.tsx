import React, { createContext, useContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/sockets/socket";

type User = {
    uid: string;
    name: string;
    role: string;
    email: string;
};

type UserContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: React.PropsWithChildren) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            console.log("Usuario detectado, conectando socket...");
            connectSocket();
        } else {
            console.log("Sin usuario, desconectando socket...");
            disconnectSocket();
        }
    }, [user?.uid]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser debe usarse dentro de UserProvider");
    return ctx;
}
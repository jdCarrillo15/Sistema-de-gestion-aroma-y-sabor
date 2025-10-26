import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSocket } from "./socketContext"; 

interface Notification {
  id: string;
  billId: string;
  table: string;
  productName: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (billId: string) => void;
  clearNotifications: () => void;
  hasUnreadForTable: (tableId: string) => boolean;
  getUnreadCountForTable: (tableId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: React.PropsWithChildren) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket(); 

  useEffect(() => {
    
    if (!socket) {
      console.log("Esperando conexión de socket para notificaciones...");
      return;
    }

    console.log("Socket disponible, configurando listeners de notificaciones");

    const handleProductoListo = (data: any) => {
      console.log(" Producto listo recibido:", data);

      
      const newNotification: Notification = {
        id: `${data.billId}-${data.productId}-${Date.now()}`,
        billId: data.billId,
        table: data.table,
        productName: data.productName,
        timestamp: data.timestamp,
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      
      playNotificationSound();
    };

    socket.on("productoListo", handleProductoListo);

    return () => {
      socket.off("productoListo", handleProductoListo);
    };
  }, [socket]); 

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
     
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.value = 1200;
      osc1.type = "sine";
      
      gain1.gain.setValueAtTime(0.5, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.3);
      
    
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.value = 1200;
      osc2.type = "sine";
      
      gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
      
      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.45);
    } catch (error) {
      console.error("Error reproduciendo sonido:", error);
    }
  }, []);

  const markAsRead = useCallback((billId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.billId === billId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const hasUnreadForTable = useCallback(
    (tableId: string) => {
      return notifications.some((n) => n.billId === tableId && !n.read);
    },
    [notifications]
  );

  const getUnreadCountForTable = useCallback(
    (tableId: string) => {
      return notifications.filter((n) => n.billId === tableId && !n.read).length;
    },
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
        hasUnreadForTable,
        getUnreadCountForTable,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
}
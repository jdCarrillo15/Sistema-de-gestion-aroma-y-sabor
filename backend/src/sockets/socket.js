let ioInstance = null;
const connectedUsers = new Map();

export default function socketHandler(io) {
    if (!io) throw new Error("Socket.io no inicializado");
    ioInstance = io;

    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} se unió a la sala: ${room}`);
        });

        socket.on("leaveRoom", (room) => {
            socket.leave(room);
            console.log(`Socket ${socket.id} salió de la sala: ${room}`);
        });

        socket.on("joinRole", (data) => {
            const { role, name } = data;
            if (!role) return;

            const existing = connectedUsers.get(socket.id);
            if (existing && existing.role === role) return;

            const userInfo = {
                socketId: socket.id,
                role,
                name,
                timestamp: new Date().toISOString(),
            };

            connectedUsers.set(socket.id, userInfo);
            socket.join(role);

            console.log(`${socket.id} (${name}) unido al rol ${role}`);

            io.to("admin").emit("nuevoUsuarioConectado", userInfo);

            if (role === "admin") {
                socket.emit("usuariosConectados", Array.from(connectedUsers.values()));
            }
        });

        socket.on("disconnect", () => {
            const user = connectedUsers.get(socket.id);
            if (user) {
                connectedUsers.delete(socket.id);
                console.log(`Cliente desconectado: ${socket.id} (${user.role})`);
                io.to("admin").emit("usuarioDesconectado", user);
            }
        });

        socket.on("connect_error", (err) => {
            console.error("Error de conexión socket:", err.message);
        });
    });
}

export const getIO = () => {
    if (!ioInstance) throw new Error("Socket.io no inicializado");
    return ioInstance;
};
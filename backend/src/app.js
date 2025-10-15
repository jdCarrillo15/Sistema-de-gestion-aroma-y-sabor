import { metricsMiddleware } from "./middleware/metrics.js";
import productsRoutes from "./routes/productsRoutes.js";
import metricsRoutes from "./routes/metricsRoutes.js"
import usersRoutes from "./routes/usersRoutes.js";
import billsRoutes from "./routes/billsRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import rolesRoutes from "./routes/roleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import socketHandler from "./sockets/socket.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://148.230.93.151",
      "https://cafearomaysabor.com",
      "https://www.cafearomaysabor.com"
    ],
    credentials: true,
  },
});

socketHandler(io);


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://148.230.93.151",
    "https://cafearomaysabor.com",
    "https://www.cafearomaysabor.com"
  ],
  credentials: true
}));

app.use(metricsMiddleware);

app.use("/roles", rolesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/bills", billsRoutes);
app.use("/tables", tableRoutes);
app.use(metricsRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://148.230.93.151:${PORT}`);
});

export default app;

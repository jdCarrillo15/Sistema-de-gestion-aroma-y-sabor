import express from "express";
import rolesRoutes from "./routes/roleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import { metricsMiddleware } from "./middleware/metrics.js";
import metricsRoutes from "./routes/metricsRoutes.js"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.use(metricsMiddleware);

app.use("/roles", rolesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use(metricsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;

import express from "express";
import { register } from "../monitoring/prometheus.js";

const router = express.Router();

router.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

export default router;

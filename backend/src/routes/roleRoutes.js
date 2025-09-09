import express from "express";
import { checkAuth } from "../middleware/auth.js";
import { assignRole } from "../controllers/rolesController.js";

const router = express.Router();

router.post("/assign-role", checkAuth, assignRole);

export default router;




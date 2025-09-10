import express from "express";
import { checkAuth } from "../middleware/auth.js";
import { modifyRole } from "../controllers/rolesController.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

router.post("/modify-role", checkAuth, requireRole("admin"), modifyRole);

export default router;




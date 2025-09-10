import express from "express";
import { modifyRole } from "../controllers/rolesController.js";
import { checkRoleWithAuth } from "../middleware/roles.js";

const router = express.Router();

router.post("/modify-role", checkRoleWithAuth("admin"), modifyRole);

export default router;




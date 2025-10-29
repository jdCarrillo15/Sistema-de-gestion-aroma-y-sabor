import express from "express";
import { getReports } from "../controllers/reportsController.js";
import { checkRoleWithAuth } from "../middleware/roles.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/getreports/:id", authenticate, authorize("read","bills"), getReports);

export default router;


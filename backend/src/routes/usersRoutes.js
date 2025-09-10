import express from "express";
import { checkAuth } from "../middleware/auth.js";
import { createUserAndPerson, getUsers, getUsersFromDB } from "../controllers/usersController.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

router.get("/getusers", checkAuth, requireRole("admin"), getUsers);
router.get("/getusersdb", checkAuth, requireRole("admin"), getUsersFromDB);
router.post("/createUser", checkAuth, requireRole("admin"), createUserAndPerson)

export default router;




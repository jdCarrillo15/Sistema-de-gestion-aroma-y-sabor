import express from "express";
import { createUserAndPerson, getUsers, getUsersFromDB } from "../controllers/usersController.js";
import { checkRoleWithAuth } from "../middleware/roles.js";
import { authenticate, authorize, authorizeComposite, checkAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/getusers", checkAuth, authorize("users", "read"), getUsers);
router.get("/getusersdb", checkAuth, authorize("users", "read"), getUsersFromDB);
router.post("/createuser", checkAuth, authorizeComposite("create_user_and_person"), createUserAndPerson)

export default router;



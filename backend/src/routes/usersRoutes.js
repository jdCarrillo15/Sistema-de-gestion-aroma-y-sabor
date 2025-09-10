import express from "express";
import { createUserAndPerson, getUsers, getUsersFromDB } from "../controllers/usersController.js";
import { checkRoleWithAuth } from "../middleware/roles.js";

const router = express.Router();

router.get("/getusers", checkRoleWithAuth("admin"), getUsers);
router.get("/getusersdb", checkRoleWithAuth("admin"), getUsersFromDB);
router.post("/createuser", checkRoleWithAuth("admin"), createUserAndPerson)

export default router;




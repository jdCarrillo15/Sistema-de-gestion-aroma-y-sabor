import express from "express";
import { checkAuth } from "../middleware/auth.js";
import { getUsers, getUsersFromDB } from "../controllers/usersController.js";

const router = express.Router();

router.get("/getusers", checkAuth, getUsers);
router.get("/getusersdb", checkAuth, getUsersFromDB);


export default router;




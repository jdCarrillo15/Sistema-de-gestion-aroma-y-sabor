import express from "express";
import { checkAuth } from "../middleware/auth.js"
import { login, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login)
router.post("/logout", checkAuth, logout)

export default router;




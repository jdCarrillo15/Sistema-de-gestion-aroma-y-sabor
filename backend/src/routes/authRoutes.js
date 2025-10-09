import express from "express";
import { login, logout, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)

export default router;




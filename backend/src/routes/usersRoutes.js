import express from "express";
import { createUserAndPerson, getUserById, getUsers, updateUserById, hardDeleteUser, changeStateUser } from "../controllers/usersController.js";
import { authenticate, authorize, loadResourceState } from "../middleware/auth.js";

const router = express.Router();

router.get("/getusers", authenticate, authorize("read", "users"), getUsers);
router.post("/createuser", authenticate, authorize("create_user_and_person", "users"), createUserAndPerson)
router.get("/getuser/:id", authenticate, authorize("read", "users"), getUserById);
router.put("/updateuser/:id", authenticate, authorize("update", "users"), updateUserById);
router.delete("/harddeleteuser/:id", authenticate, authorize("delete", "users"), hardDeleteUser);
router.put("/changeState/:id", authenticate, authorize("update", "users"), changeStateUser);

export default router;



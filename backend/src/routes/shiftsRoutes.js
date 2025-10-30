import express from "express";
import { createShift, getShiftById, getShifts, updateShiftById, deleteShift  } from "../controllers/shiftsController.js";
import { authenticate, authorize, loadResourceState } from "../middleware/auth.js";

const router = express.Router();

router.get("/getShifts", authenticate, authorize("read", "shifts"), getShifts);
router.post("/createShift", authenticate, authorize("create", "shifts"), createShift);
router.get("/getShift/:id", authenticate, authorize("read", "shifts"), getShiftById);
router.put("/updateShift/:id", authenticate, loadResourceState("shifts"), authorize("update", "shifts"), updateShiftById);
router.delete("/hardDeleteShift/:id", authenticate, authorize("delete", "shifts"), deleteShift);


export default router;
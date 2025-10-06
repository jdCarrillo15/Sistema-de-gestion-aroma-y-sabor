import express from "express";
import { createBill, getBillById, getBills, updateBillById, hardDeleteBill } from "../controllers/billsController.js";
import { authenticate, authorize, loadResourceState } from "../middleware/auth.js";

const router = express.Router();

router.get("/getBills", authenticate, authorize("read", "bills"), getBills);
router.post("/createBill", authenticate, authorize("create", "bills"), createBill);
router.get("/getBill/:id", authenticate, authorize("read", "bills"), getBillById);
router.put("/updateBill/:id", authenticate, authorize("update", "bills"), updateBillById);
router.delete("/harddeleteBill/:id", authenticate, authorize("delete", "bills"), hardDeleteBill);

export default router;

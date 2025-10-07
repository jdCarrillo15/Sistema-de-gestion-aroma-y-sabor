import express from "express";
import { createBill, getBillById, getBills, updateBillById, hardDeleteBill, addProductToBill, removeProductFromBill, updateProductsInBill } from "../controllers/billsController.js";
import { authenticate, authorize, loadResourceState } from "../middleware/auth.js";

const router = express.Router();

router.get("/getBills", authenticate, authorize("read", "bills"), getBills);
router.post("/createBill", authenticate, authorize("create", "bills"), createBill);
router.get("/getBill/:id", authenticate, authorize("read", "bills"), getBillById);
router.put("/updateBill/:id", authenticate, authorize("update", "bills"), updateBillById);
router.delete("/harddeleteBill/:id", authenticate, authorize("delete", "bills"), hardDeleteBill);
router.post("/addProductToBill/:id", authenticate, authorize("update", "bills"), addProductToBill);
router.post("/removeProductFromBill/:id", authenticate, authorize("update", "bills"), removeProductFromBill);
router.put("/updateProductsInBill/:id", authenticate, authorize("update", "bills"), updateProductsInBill);
// router.put("/closeBillIfEmpty/:id", authenticate, authorize("update", "bills"), closeBillIfEmpty);


export default router;

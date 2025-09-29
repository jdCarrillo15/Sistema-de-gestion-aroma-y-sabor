import express from "express";
import { createProduct, getProductById, getProducts, updateProductById, hardDeleteProduct } from "../controllers/productsController.js";
import { authenticate, authorize, loadResourceState } from "../middleware/auth.js";

const router = express.Router();

router.get("/getproducts", authenticate, authorize("read", "products"), getProducts);
router.post("/createproduct", authenticate, authorize("create", "products"), createProduct);
router.get("/getproduct/:id", authenticate, authorize("read", "products"), getProductById);
router.put("/updateproduct/:id", authenticate, authorize("update", "products"), updateProductById);
router.delete("/harddeleteproduct/:id", authenticate, authorize("delete", "products"), hardDeleteProduct);

export default router;

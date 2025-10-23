import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
    getTables,
    updateTable,
    freeTable,
    getTableById,
    createTable,
    changeTableStatus,
    deleteTable
} from "../controllers/tablesController.js";

const router = express.Router();

router.get("/getTables", authenticate, authorize("read", "tables"), getTables);
router.put("/updateTable/:id", authenticate, authorize("update", "tables"), updateTable);
router.put("/freeTable/:id", authenticate, authorize("update", "tables"), freeTable);
router.get("/getTableById/:id", authenticate, authorize("read", "tables"), getTableById);
router.post("/createTable", authenticate, authorize("create", "tables"), createTable);
router.put("/changeTableStatus/:id", authenticate, authorize("update", "tables"), changeTableStatus);
router.delete("/deleteTable/:id", authenticate, authorize("delete", "tables"), deleteTable);

export default router;

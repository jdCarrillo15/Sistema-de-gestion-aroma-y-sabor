import express from "express";
import { getTables, updateTable, freeTable } from "../controllers/tablesController.js";

const router = express.Router();

router.get("/getTables", getTables);
router.put("/updateTable/:id", updateTable);
router.put("/freeTable/:id", freeTable);

export default router;

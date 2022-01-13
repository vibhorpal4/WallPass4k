import express from "express";
import * as categoryController from "../Controllers/categoryController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/create", authMiddleware, categoryController.createCategory);
router.delete("/:id/delete", authMiddleware, categoryController.deleteCategory);

export default router;

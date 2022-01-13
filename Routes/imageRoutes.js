import express from "express";
import authMiddleware from "../Middlewares/authMiddleware.js";
import * as imageController from "../Controllers/imageController.js";

const router = express.Router();

router.post("/upload", authMiddleware, imageController.uploadImage);
router.get("/", imageController.getAllImages);
router.get("/:id", imageController.getImage);
router.delete("/:id/delete", authMiddleware, imageController.deleteImage);

export default router;

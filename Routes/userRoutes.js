import express from "express";
import * as userController from "../Controllers/userController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", userController.getAllUser);
router.get("/:username", userController.getUser);
router.delete("/:username/delete", authMiddleware, userController.deleteUser);
router.put("/:username/update", authMiddleware, userController.updateUser);
router.get("/users/stats", userController.getUserStats);

export default router;

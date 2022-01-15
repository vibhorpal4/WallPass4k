import express from "express";
import * as userController from "../Controllers/userController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", userController.getAllUser);
router.get("/:username", userController.getUser);
router.delete("/:username/delete", authMiddleware, userController.deleteUser);
router.patch("/:username/update", authMiddleware, userController.updateUser);
router.get("/users/stats", userController.getUserStats);
router.put("/:id/follow", authMiddleware, userController.followUser);
router.put("/:id/unfollow", authMiddleware, userController.unfollowUser);

export default router;

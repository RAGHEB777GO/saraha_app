
import { Router } from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} from "./message.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Send a new message
router.post("/send", auth, sendMessage);

// Get all messages of the logged-in user
router.get("/my-messages", auth, getMessages);

// Mark message as read
router.put("/mark-read/:id", auth, markAsRead);

// Delete a specific message by ID
router.delete("/delete/:messageId", auth, deleteMessage);

export default router;

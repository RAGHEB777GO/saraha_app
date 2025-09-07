import { Router } from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadProfileImage,
  refreshAccessToken,
} from "./user.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.js";
import { validateBody } from "../../middlewares/validation.js";
import { signupSchema } from "./user.validation.js";

import uploadCloud from "../../middlewares/uploadCloud.js";
import passport from "../../config/passport.js";
import jwt from "jsonwebtoken";

const router = Router();

// Signup
router.post("/signup", validateBody(signupSchema), signup);

// Login
router.post("/login", login);

// Refresh Token
router.post("/refresh-token", refreshAccessToken);

// Google OAuth Login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Google login success", token });
  }
);

// Profile
router.get("/profile", auth, getProfile);

// Update Profile
router.put("/profile", auth, updateProfile);

// Admin Route
router.get("/admin", auth, authorize("admin"), (req, res) => {
  res.status(200).json({ message: "Welcome Admin!" });
});

// Get all users (Admin only)
router.get("/all", auth, authorize("admin"), getAllUsers);

// Change Password
router.put("/change-password", auth, changePassword);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.put("/reset-password/:token", resetPassword);

// Upload Profile Image (Cloudinary)
router.post(
  "/upload-profile",
  auth,
  uploadCloud.single("profileImage"),
  uploadProfileImage
);

export default router;

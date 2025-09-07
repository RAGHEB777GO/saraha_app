import User from "../../models/user.model.js";
import RefreshToken from "../../models/refreshToken.model.js";
import { hashPassword } from "./user.service.js";
import { signupSchema } from "./user.validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Signup
export const signup = async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { userName, email, password, phone, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email exists" });

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshTokenValue = crypto.randomBytes(40).toString("hex");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await RefreshToken.create({
      token: refreshTokenValue,
      user: user._id,
      expires,
    });

    res.status(200).json({
      message: "Login success",
      accessToken,
      refreshToken: refreshTokenValue,
    });
  } catch (err) {
    next(err);
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const savedToken = await RefreshToken.findOne({ token: refreshToken }).populate("user");
    if (!savedToken) return res.status(403).json({ message: "Invalid refresh token" });

    if (savedToken.expires < new Date()) {
      await savedToken.deleteOne();
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const user = savedToken.user;
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const deleted = await RefreshToken.findOneAndDelete({ token: refreshToken });
    if (!deleted) return res.status(404).json({ message: "Refresh token not found" });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
};

// Get profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { userName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { userName, email, phone },
      { new: true, runValidators: true, select: "-password" }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Provide old & new password" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!(await bcrypt.compare(oldPassword, user.password)))
      return res.status(400).json({ message: "Old password wrong" });

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.status(200).json({
      message: "Reset token generated",
      resetToken: token,
    });
  } catch (err) {
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token invalid/expired" });

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Profile image uploaded",
      profileImage: imageUrl,
      user,
    });
  } catch (err) {
    next(err);
  }
};

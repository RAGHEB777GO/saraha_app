import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);

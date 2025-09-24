import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    bio: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    settings: {
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
      privacy: { type: String, enum: ["public", "private"], default: "public" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);

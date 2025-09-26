import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    gender: { type: String},
    dateOfBirth: { type: String},
    avatarUrl: { type: String, default: "https://cloudanary.s3.ap-southeast-1.amazonaws.com/basic-avatar.jpg" },
    bio: {type: String, default: ""},
    isOnBoarded: {type: Boolean, default: false},
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

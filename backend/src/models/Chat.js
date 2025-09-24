import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    groupName: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);

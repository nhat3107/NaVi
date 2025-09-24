import mongoose from "mongoose";

const VideoCallSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startedAt: Date,
    endedAt: Date,
    status: { type: String, enum: ["active", "ended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("VideoCall", VideoCallSchema);

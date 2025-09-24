import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    mediaUrls: [String],
    aiModeration: {
      nsfw: { type: Boolean, default: false },
      violence: { type: Boolean, default: false },
      confidence: { type: Number, default: 0 },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);

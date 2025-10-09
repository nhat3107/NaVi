import {
  getMessagesService,
  sendMessageService,
} from "../services/message.service.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const { limit = 30, before } = req.query;
  const messages = await getMessagesService(chatId, { limit, before });
  if (!messages) {
    return res.status(404).json({ message: "Messages not found" });
  }
  res.json({ message: "Messages fetched successfully", messages });
};

export const sendMessage = async (req, res) => {
  const { message: payload } = req.body;
  const chatId = payload?.chatId || req.body.chatId;
  const type = payload?.type || req.body.type || "text";
  const content = payload?.content || req.body.content;
  const senderId = req.user?._id;
  const message = await sendMessageService(chatId, senderId, type, content);
  if (!message) {
    return res.status(400).json({ message: "Failed to send message" });
  }
  // Emit to room so receivers update immediately
  io.to(String(chatId)).emit("new-message", message);
  res.status(201).json({ message: "Message sent successfully", message });
};

export async function signUpload(req, res) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  // Sign ALL params that will be sent to Cloudinary (except file, api_key, cloud_name)
  const folder = "navi_storage";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}

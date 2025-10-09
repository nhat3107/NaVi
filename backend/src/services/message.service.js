import Message from "../models/Message.js";
import { updateLastMessageService } from "./chat.service.js";

export const getMessagesService = async (
  chatId,
  { limit = 30, before } = {}
) => {
  const query = { chatId };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  // We want newest last in the array (ascending by createdAt) while limiting to latest messages.
  // Strategy: sort desc, limit, then reverse in memory to ascending.
  const docs = await Message.find(query)
    .populate("senderId", "username avatarUrl")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  return docs.reverse();
};

export const sendMessageService = async (chatId, senderId, type, content) => {
  const message = new Message({ chatId, senderId, type, content });
  await message.save();
  await updateLastMessageService(chatId);
  const populatedMessage = await message.populate(
    "senderId",
    "username avatarUrl"
  );
  return populatedMessage;
};

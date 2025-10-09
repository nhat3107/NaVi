import { motion } from "framer-motion";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function MessageBubble({ message }) {
  const { user } = useAuthStore();
  const senderId =
    message?.senderId?._id || message?.senderId || message?.sender;
  const isMe = senderId && user?._id && String(senderId) === String(user._id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div className="flex items-end gap-2 max-w-full">
        {/* Sender avatar on left for incoming messages */}
        {!isMe && message?.senderId?.avatarUrl && (
          <img
            src={message.senderId.avatarUrl}
            alt={message.senderId.username || "avatar"}
            className="w-6 h-6 rounded-full self-end"
          />
        )}
        <div
          className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md ${
            isMe
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
          }`}
        >
          {/* Image display */}
          {message?.type === "image" && message?.content && (
            <div className="mb-2">
              <img
                src={message.content}
                alt="Message attachment"
                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.content, "_blank")}
              />
            </div>
          )}

          {/* Text content */}
          {(!message?.type || message?.type === "text") && (
            <div className="break-words">
              {message?.content || message?.text}
            </div>
          )}

          {/* Timestamp */}
          {(message?.createdAt || message?.timestamp) && (
            <div
              className={`text-xs mt-1 ${
                isMe ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {new Date(
                message?.createdAt || message?.timestamp
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function MessageBubble({ message }) {
  const { user } = useAuthStore();
  const senderId =
    message?.senderId?._id || message?.senderId || message?.sender;
  const isMe = senderId && user?._id && String(senderId) === String(user._id);

  if (message?.type === "call") {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 sm:mb-3`}
    >
      <div className={`flex items-start gap-2.5 sm:gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar - Only show for received messages */}
        {!isMe && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
              {message?.senderId?.avatarUrl ? (
                <img
                  src={message.senderId.avatarUrl}
                  alt={message.senderId.username || "avatar"}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <span>{message?.senderId?.username?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
          </div>
        )}

        <div className={`flex-1 min-w-0 ${isMe ? "flex items-end flex-col" : ""}`}>
          {/* Username - Only show for received messages */}
          {!isMe && (
            <div className="mb-1 sm:mb-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 truncate">
                {message?.senderId?.fullName || message?.senderId?.username || "Unknown User"}
              </h4>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`rounded-xl shadow-sm border ${
              isMe
                ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 dark:border-indigo-400 rounded-br-md"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-bl-md"
            }`}
          >
            <div className="px-4 sm:px-5 py-2.5 sm:py-3">
              {message?.type === "image" && message?.content && (
                <div className="mb-2 sm:mb-2.5">
                  <img
                    src={message.content}
                    alt="Message attachment"
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity max-h-[300px] sm:max-h-[400px] object-contain"
                    onClick={() => window.open(message.content, "_blank")}
                  />
                </div>
              )}

              {(!message?.type || message?.type === "text") && (
                <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                  {message?.content || message?.text}
                </p>
              )}
            </div>

            {/* Timestamp */}
            {(message?.createdAt || message?.timestamp) && (
              <div className={`px-4 sm:px-5 pb-2 sm:pb-2.5 ${
                isMe ? "text-indigo-100 dark:text-indigo-200" : "text-gray-500 dark:text-gray-400"
              }`}>
                <p className="text-xs sm:text-sm">
                  {formatDate(message?.createdAt || message?.timestamp)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import useVideoCall from "../../../hooks/useVideoCall";
import toast from "react-hot-toast";

export default function ChatHeader({
  toggleSidebar,
  selectedChat,
  onCloseChat,
}) {
  const { initiateCall } = useVideoCall();

  const handleVideoCall = async () => {
    if (!selectedChat) {
      toast.error("Please select a chat");
      return;
    }

    if (!selectedChat.participants || !Array.isArray(selectedChat.participants)) {
      toast.error("Invalid chat data");
      return;
    }

    if (!selectedChat._id) {
      toast.error("Invalid chat ID");
      return;
    }

    try {
      const participantIds = selectedChat.participants
        .map((p) => {
          if (typeof p === "string") return p;
          return p._id || p.id || null;
        })
        .filter((id) => id && id !== "");

      if (participantIds.length === 0) {
        toast.error("No participants found");
        return;
      }

      await initiateCall(participantIds, selectedChat._id);
    } catch (error) {
      toast.error(error.message || "Failed to start video call");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
      <button
        onClick={toggleSidebar}
        className="md:hidden text-gray-600 dark:text-gray-300 text-2xl"
      >
        ☰
      </button>

      <div className="flex items-center gap-3">
        <img
          src={selectedChat?.avatar || "https://i.pravatar.cc/40?img=5"}
          alt={selectedChat?.name || "Chat"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            {selectedChat?.name || "Select a chat"}
          </h3>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleVideoCall}
          className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
          title="Start video call"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          onClick={onCloseChat}
          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
          title="Close chat"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

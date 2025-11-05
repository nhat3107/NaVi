import ChatContainer from "../components/chat-comp/ChatContainer";
import Sidebar from "../components/chat-comp/ChatSidebar";
import CreateGroupModal from "../components/chat-comp/CreateGroupModal";
import Navbar from "../components/Navbar";
import { useState } from "react";
// Removed framer-motion because we keep a single Sidebar instance to preserve state
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const queryClient = useQueryClient();

  // When a chat is selected, close the mobile sidebar
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-1 ml-20 relative overflow-hidden">
      {(() => {
        const mobileVisible = !selectedChat || sidebarOpen;
        const mobileClasses = mobileVisible
          ? "absolute inset-0 z-20"
          : "hidden";
        return (
          <div
            className={`${mobileClasses} md:static md:block w-full md:w-1/4 h-full border-r bg-white dark:bg-gray-800`}
          >
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onOpenCreateGroup={() => setCreateGroupOpen(true)}
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.id}
            />
          </div>
        );
      })()}

      {/* Chat container */}
      <div className={`flex-1 ${!selectedChat ? "hidden md:block" : ""}`}>
        <ChatContainer
          toggleSidebar={() => setSidebarOpen(true)}
          selectedChat={selectedChat}
          onCloseChat={() => setSelectedChat(null)}
        />
      </div>

        <CreateGroupModal
          open={createGroupOpen}
          onClose={() => setCreateGroupOpen(false)}
          onSubmit={async ({ name, memberIds }) => {
            // Create group on backend and select it
            try {
              const { createGroupChat } = await import("../lib/api");
              const res = await createGroupChat(name, memberIds);
              const chat = res.chat;
              if (chat) {
                await queryClient.invalidateQueries({ queryKey: ["chats"] });
                // Optimistically add group chat to cache for instant UI
                queryClient.setQueryData(["chats"], (old) => {
                  const prev = Array.isArray(old) ? old : old?.chats || [];
                  if (prev.find((c) => c._id === chat._id)) return prev;
                  const optimistic = {
                    _id: chat._id,
                    isGroup: true,
                    groupName: chat.groupName,
                    participants: chat.participants || [],
                  };
                  return [optimistic, ...prev];
                });
                setSelectedChat({
                  id: chat._id,
                  _id: chat._id,
                  name: chat.groupName,
                  avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                    chat.groupName || chat._id
                  )}`,
                  lastMessage: chat.lastMessage || "",
                  type: "group",
                });
                toast.success("Tạo nhóm thành công");
              } else {
                toast.error("Không thể tạo nhóm");
              }
            } catch (err) {
              console.error("Create group error", err);
              toast.error(err?.response?.data?.message || "Lỗi tạo nhóm");
            } finally {
              setCreateGroupOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}

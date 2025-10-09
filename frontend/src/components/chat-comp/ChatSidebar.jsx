import { useMemo, useState } from "react";
import SearchInput from "./SearchInput";
import toast from "react-hot-toast";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { useAuthStore } from "../../stores/useAuthStore";
import { createPersonalChat } from "../../lib/api";
import { useChats } from "../../hooks/useChats";
import { useQueryClient } from "@tanstack/react-query";

// Load real chats
const formatChatItem = (chat, currentUserId) => {
  const isGroup = chat.isGroup;
  const name = isGroup
    ? chat.groupName || "Group"
    : (chat.participants || []).find(
        (p) => String(p._id) !== String(currentUserId)
      )?.username || "User";
  const avatar = isGroup
    ? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        name
      )}`
    : (chat.participants || []).find(
        (p) => String(p._id) !== String(currentUserId)
      )?.avatarUrl;
  return {
    id: chat._id,
    _id: chat._id,
    name,
    avatar,
    lastMessage: chat.lastMessage || "",
    type: isGroup ? "group" : "personal",
  };
};

export default function Sidebar({
  onClose,
  chatss,
  onOpenCreateGroup,
  onSelectChat,
  selectedChatId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'group' | 'users'
  const { user } = useAuthStore();
  const { data: chats = [] } = useChats();
  const queryClient = useQueryClient();

  // User search functionality
  const {
    users: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useSearchUsers(searchTerm);

  // Auth store for logout
  const { logout } = useAuthStore();

  // Handle creating new chat with user
  const handleCreateChat = async (user) => {
    try {
      // Expect backend to create or return existing personal chat
      const res = await createPersonalChat([user._id]);
      const chat = res.chat;
      if (chat) {
        toast.success("Chat is ready");
        // Refresh chats list
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
        // Optimistically prepend new chat to cache for instant UI
        queryClient.setQueryData(["chats"], (old) => {
          const prev = Array.isArray(old) ? old : old?.chats || [];
          // minimal chat shape
          const optimistic = {
            _id: chat._id,
            isGroup: false,
            groupName: "",
            participants: [
              { _id: user?._id },
              { _id: user._id === user?._id ? user._id : user?._id },
            ],
          };
          // Avoid duplicates if already present
          if (prev.find((c) => c._id === chat._id)) return prev;
          return [optimistic, ...prev];
        });
        // Map to sidebar chat item shape if needed
        onSelectChat?.({
          id: chat._id,
          _id: chat._id,
          name: user.username,
          avatar: user.avatarUrl,
          lastMessage: chat.lastMessage || "",
          type: "personal",
        });
      } else {
        toast.error("Could not create chat");
      }
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to create chat");
    }
  };

  // Users displayed (only real results)
  const displayUsers = useMemo(() => {
    if (searchLoading || searchError) return [];
    return searchResults || [];
  }, [searchResults, searchLoading, searchError]);

  const personalData = useMemo(() => {
    const items = (chats || [])
      .filter((c) => !c.isGroup)
      .map((c) => formatChatItem(c, user?._id));
    return items;
  }, [chats, user?._id]);

  const groupData = useMemo(() => {
    const items = (chats || [])
      .filter((c) => c.isGroup)
      .map((c) => formatChatItem(c, user?._id));
    return items;
  }, [chats, user?._id]);

  const filteredPersonal = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return personalData;
    return personalData.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const last = (c.lastMessage || "").toLowerCase();
      return name.includes(term) || last.includes(term);
    });
  }, [personalData, searchTerm]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groupData;
    return groupData.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const last = (c.lastMessage || "").toLowerCase();
      return name.includes(term) || last.includes(term);
    });
  }, [groupData, searchTerm]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Chats
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateGroup}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            title="Create a new group"
          >
            <span>＋</span>
            <span className="hidden sm:inline">Create a group</span>
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 dark:text-gray-300 text-xl"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            activeTab === "personal"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("personal")}
        >
          Personal
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            activeTab === "group"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("group")}
        >
          Group
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Search for a user
        </button>
      </div>

      <div className="mb-3">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === "users"
              ? "Search for a user by name..."
              : "Search for a chat..."
          }
        />
      </div>

      <div className="space-y-2 overflow-y-auto">
        {activeTab === "users" ? (
          // User search results
          <>
            {searchLoading && (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                Searching...
              </div>
            )}
            {searchError && (
              <div className="text-sm text-red-500 dark:text-red-400 py-6 text-center">
                {searchError}
              </div>
            )}
            {!searchLoading &&
              !searchError &&
              displayUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  onClick={() => handleCreateChat(user)}
                >
                  <img
                    src={
                      user.avatarUrl ||
                      "https://cloudanary.s3.ap-southeast-1.amazonaws.com/basic-avatar.jpg"
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {user.username}
                    </h3>
                    {user.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateChat(user);
                    }}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 md:transform md:scale-90 md:group-hover:scale-100"
                    title="Create a chat"
                  >
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="md:hidden">Chat</span>
                    </span>
                  </button>
                </div>
              ))}
            {!searchLoading &&
              !searchError &&
              displayUsers.length === 0 &&
              searchTerm.trim().length >= 2 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                  No user found
                </div>
              )}
            {!searchLoading && !searchError && searchTerm.trim().length < 2 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                Enter at least 2 characters to search
              </div>
            )}
          </>
        ) : (
          // Chat results (personal/group)
          <>
            {(activeTab === "personal" ? filteredPersonal : filteredGroups).map(
              (chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat?.(chat)}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedChatId === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                      : ""
                  }`}
                >
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {chat.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              )
            )}
            {(activeTab === "personal" ? filteredPersonal : filteredGroups)
              .length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                No chat found
              </div>
            )}
          </>
        )}
      </div>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

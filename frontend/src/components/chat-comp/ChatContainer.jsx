import ChatHeader from "./ChatContainer/ChatHeader";
import MessageList from "./ChatContainer/MessageList";
import MessageInput from "./ChatContainer/MessageInput";
import EmptyChatState from "./EmptyChatState";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMessages } from "../../hooks/useMessages";
import { useSendMessage } from "../../hooks/useSendMessage";

export default function ChatContainer({
  toggleSidebar,
  selectedChat,
  onCloseChat,
}) {
  const chatId = selectedChat?._id || selectedChat?.id;
  const { messages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(chatId);
  const { sendMessage } = useSendMessage(chatId, {
    onError: (msg) => {
      toast.error(msg);
    },
  });

  const handleSend = (payload) => {
    if (!chatId) return;
    // payload: string (text) or File (image)
    sendMessage(payload);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {selectedChat ? (
        <>
          <ChatHeader
            toggleSidebar={toggleSidebar}
            selectedChat={selectedChat}
            onCloseChat={onCloseChat}
          />
          <MessageList
            messages={messages}
            onLoadMore={
              hasNextPage && !isFetchingNextPage
                ? () => fetchNextPage()
                : undefined
            }
          />
          <MessageInput onSend={handleSend} />
        </>
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
}

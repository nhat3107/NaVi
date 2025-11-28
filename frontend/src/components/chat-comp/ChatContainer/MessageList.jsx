import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages = [], onLoadMore, isLoading, hasError, chatId }) {
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const previousChatIdRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const scrollPositionRef = useRef(null);

  useEffect(() => {
    if (chatId !== previousChatIdRef.current) {
      previousChatIdRef.current = chatId;
      setIsAtBottom(true);
      isLoadingMoreRef.current = false;
      scrollPositionRef.current = null;
      
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  }, [chatId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !chatId || chatId !== previousChatIdRef.current) return;

    if (isAtBottom && !isLoadingMoreRef.current) {
      requestAnimationFrame(() => {
        if (el && isAtBottom) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  }, [messages.length, isAtBottom, chatId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (isLoadingMoreRef.current) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      const nearBottom = distanceFromBottom < 150;
      setIsAtBottom(nearBottom);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!onLoadMore) return;
    const el = scrollRef.current;
    if (!el) return;

    let loading = false;
    const handleScroll = async () => {
      if (loading || isLoading || isLoadingMoreRef.current) return;

      const scrollTop = el.scrollTop;
      
      if (scrollTop <= 100) {
        loading = true;
        isLoadingMoreRef.current = true;
        setIsAtBottom(false);
        
        const previousScrollHeight = el.scrollHeight;
        const previousScrollTop = el.scrollTop;
        scrollPositionRef.current = { previousScrollHeight, previousScrollTop };
        
        try {
          await onLoadMore();
          
          requestAnimationFrame(() => {
            if (el && scrollPositionRef.current) {
              const { previousScrollHeight, previousScrollTop } = scrollPositionRef.current;
              const newScrollHeight = el.scrollHeight;
              const heightDiff = newScrollHeight - previousScrollHeight;
              el.scrollTop = previousScrollTop + heightDiff;
              scrollPositionRef.current = null;
            }
            isLoadingMoreRef.current = false;
          });
        } catch (error) {
          isLoadingMoreRef.current = false;
          scrollPositionRef.current = null;
        } finally {
          loading = false;
        }
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, isLoading]);

  useEffect(() => {
    if (!isLoading && messages.length > 0 && chatId === previousChatIdRef.current) {
      const el = scrollRef.current;
      if (el && isAtBottom && !isLoadingMoreRef.current) {
        requestAnimationFrame(() => {
          if (el && isAtBottom) {
            el.scrollTop = el.scrollHeight;
          }
        });
      }
    }
  }, [isLoading, messages.length, chatId, isAtBottom]);

  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-gray-500 text-sm">Failed to load messages</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2">
      {isLoading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      {messages.map((m) => (
        <MessageBubble key={m?._id} message={m} />
      ))}
    </div>
  );
}

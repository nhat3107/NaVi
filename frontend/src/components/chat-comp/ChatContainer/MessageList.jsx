import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages = [], onLoadMore }) {
  const scrollRef = useRef(null);
  const topSentinelRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Infinite scroll upwards to load older messages
  useEffect(() => {
    if (!onLoadMore) return;
    const el = scrollRef.current;
    if (!el) return;

    let loading = false;
    const handleScroll = async () => {
      if (el.scrollTop <= 50 && !loading) {
        loading = true;
        try {
          await onLoadMore();
        } finally {
          loading = false;
        }
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [onLoadMore]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
      <div ref={topSentinelRef} />
      {messages.map((m) => (
        <MessageBubble key={m._id || m.id} message={m} />
      ))}
    </div>
  );
}

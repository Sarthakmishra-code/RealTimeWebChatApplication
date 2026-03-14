import { useEffect, useRef } from "react";
import { useAuth } from "../context/Authcontext";

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const groupByDate = (messages) => {
  const groups = [];
  let currentDate = null;

  for (const msg of messages) {
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== currentDate) {
      groups.push({ type: "date", label: dateLabel });
      currentDate = dateLabel;
    }
    groups.push({ type: "message", data: msg });
  }
  return groups;
};

export default function MessageList({ messages, loading }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ink-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <p className="text-ink-600 text-sm font-mono">No messages yet. Say hello!</p>
        </div>
      )}

      {grouped.map((item, i) => {
        if (item.type === "date") {
          return (
            <div key={`date-${i}`} className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-ink-800" />
              <span className="text-xs font-mono text-ink-600">{item.label}</span>
              <div className="flex-1 h-px bg-ink-800" />
            </div>
          );
        }

        const msg = item.data;
        const isMine = msg.senderId === user._id;

        return (
          <div
            key={msg._id || i}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                isMine
                  ? "bg-amber-500 text-ink-950 rounded-br-sm"
                  : "bg-ink-800 text-ink-100 rounded-bl-sm"
              }`}
            >
              <p>{msg.text}</p>
              <p
                className={`text-[10px] mt-0.5 ${
                  isMine ? "text-ink-950/60" : "text-ink-500"
                } text-right`}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
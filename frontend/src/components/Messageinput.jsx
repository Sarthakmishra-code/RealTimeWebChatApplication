import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 py-3 border-t border-ink-800"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled}
        className="flex-1 bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-sm text-ink-100 
                   placeholder-ink-600 outline-none transition-all
                   focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20
                   disabled:opacity-40"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 
                   flex items-center justify-center transition-all active:scale-95
                   disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-ink-950"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </form>
  );
}
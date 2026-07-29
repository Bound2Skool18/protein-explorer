"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

const BOTTOM_THRESHOLD_PX = 80;

export function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  // Auto-scroll while pinned to the bottom; release the pin the instant the
  // user scrolls up, so a long streamed answer never yanks their view back
  // down while they're reading something above it.
  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < BOTTOM_THRESHOLD_PX);
  }

  useEffect(() => {
    if (!autoScroll) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, autoScroll]);

  function jumpToLatest() {
    setAutoScroll(true);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
    setAutoScroll(true);
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageText =
    lastMessage?.role === "assistant"
      ? lastMessage.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("")
      : "";
  // Show the thinking indicator until the first token of the reply actually
  // has content -- keyed on content presence, not on `status`, so the
  // indicator and the first token hand off in the same render rather than
  // the indicator vanishing a frame before text appears.
  const showThinking = busy && lastMessage?.role === "assistant" && lastMessageText.length === 0;

  return (
    <div className="flex flex-col h-[70vh] max-h-[700px]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-4 pb-4"
      >
        {messages.length === 0 && (
          <p className="text-sm text-on-surface-variant italic py-8 text-center">
            Ask about a protein, a gene, or general molecular biology.
          </p>
        )}

        {messages.map((message) => {
          const text = message.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join("");
          const isUser = message.role === "user";

          return (
            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  isUser
                    ? "max-w-[85%] sm:max-w-[75%] rounded-xl rounded-br-sm bg-primary text-on-primary px-4 py-2.5"
                    : "max-w-[85%] sm:max-w-[75%] rounded-xl rounded-bl-sm bg-surface-container-lowest border border-outline-variant px-4 py-2.5"
                }
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                ) : (
                  <div className="text-sm text-on-surface prose-sm [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-surface-container-low [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                    <Markdown>{text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {showThinking && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm bg-surface-container-lowest border border-outline-variant px-4 py-3">
              <span className="flex gap-1" aria-label="Assistant is thinking">
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" />
              </span>
            </div>
          </div>
        )}
      </div>

      {!autoScroll && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="self-center mb-2 flex items-center gap-1 rounded-full bg-surface-container-lowest border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface shadow-sm hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          Jump to latest
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-outline-variant">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a protein or gene..."
          disabled={busy}
          className="flex-1 min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none disabled:opacity-60"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="shrink-0 rounded-lg bg-surface-container-high text-on-surface px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-lg bg-primary text-on-primary px-4 py-3 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}

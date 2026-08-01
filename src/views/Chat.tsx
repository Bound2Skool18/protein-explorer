"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { ChatMessage } from "@/services/chat-tools";
import {
  ProteinResultCard,
  ToolError,
  ToolPending,
  ToolRunning,
} from "./ProteinToolParts";

const BOTTOM_THRESHOLD_PX = 80;

// First-run empty state: click-to-send examples that seed the conversation
// (onboarding, not an apology).
const EXAMPLE_PROMPTS = [
  "What is insulin?",
  "What does the BRCA1 gene do?",
  "Explain what a kinase is",
  "Tell me about hemoglobin",
];

export function Chat() {
  // <ChatMessage> makes message.parts typed: `part.input`/`part.output` on a
  // tool part are the real Zod/return types, not `any`.
  // `error` is set when a request fails; `regenerate` retries the LAST message
  // (not the whole conversation).
  const { messages, sendMessage, status, stop, error, regenerate } = useChat<ChatMessage>({
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
  // A tool part renders its own "working" treatment, so suppress the generic
  // thinking dots once the assistant message has one.
  const lastHasToolPart =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((p) => p.type.startsWith("tool-"));
  // Show the thinking indicator until the first token of the reply actually
  // has content -- keyed on content presence, not on `status`, so the
  // indicator and the first token hand off in the same render rather than
  // the indicator vanishing a frame before text appears.
  const showThinking =
    busy && lastMessage?.role === "assistant" && lastMessageText.length === 0 && !lastHasToolPart;

  return (
    <div className="flex flex-col h-[70dvh] max-h-[700px]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain space-y-4 pb-4"
      >
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-on-surface-variant">
              Ask about a protein, a gene, or molecular biology — or start with one of these:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => sendMessage({ text: example })}
                  className="rounded-full border border-outline-variant bg-surface-container-lowest px-3.5 py-1.5 text-sm text-on-surface hover:bg-surface-container-low hover:border-secondary active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          // User message: one plain text bubble.
          if (message.role === "user") {
            const text = message.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("");
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-xl rounded-br-sm bg-primary text-on-primary px-4 py-2.5">
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            );
          }

          // Assistant message: render each part in order -- text as a bubble,
          // tool parts as their state-specific component.
          return (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    if (!part.text) return null;
                    return (
                      <div
                        key={i}
                        className="rounded-xl rounded-bl-sm bg-surface-container-lowest border border-outline-variant px-4 py-2.5 text-sm text-on-surface prose-sm [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-surface-container-low [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    );
                  }

                  // The tool-part state machine: four states → four shapes.
                  if (part.type === "tool-lookupProtein") {
                    switch (part.state) {
                      case "input-streaming":
                        return <ToolPending key={i} />;
                      case "input-available":
                        return <ToolRunning key={i} query={part.input.query} />;
                      case "output-available":
                        return <ProteinResultCard key={i} protein={part.output} />;
                      case "output-error":
                        return <ToolError key={i} message={part.errorText} />;
                    }
                  }

                  return null;
                })}
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

        {/* Designed error + retry. `tool-fade` = calm entrance, no red flash-bang.
            Clicking Retry calls regenerate(): status leaves "error", this card
            unmounts, and the reply streams again. Disabled while busy so a
            double-click can't fire two retries. */}
        {status === "error" && (
          <div className="flex justify-start">
            <div className="tool-fade max-w-[85%] sm:max-w-[75%] rounded-xl rounded-bl-sm border border-error/40 bg-error-container/30 px-4 py-3">
              <div className="flex items-center gap-2 text-on-error-container">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span className="text-sm font-medium">Couldn&apos;t get a reply</span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                {error?.message?.includes("fetch")
                  ? "Looks like a network problem. Check your connection and try again."
                  : "The assistant ran into a problem — this can happen under heavy load."}
              </p>
              <button
                type="button"
                onClick={() => regenerate()}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-low active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Retry
              </button>
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

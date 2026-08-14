import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/services/chat-config";
import { chatTools } from "@/services/chat-tools";
import { checkRateLimit } from "@/services/rate-limit";

// 30s: generous enough for a tool call (UniProt lookup) plus a full
// streamed answer, short enough that an abandoned/hung connection can't
// tie up serverless compute indefinitely.
export const maxDuration = 30;

// Hygiene caps so a stranger (or a script) can't drain the Groq API budget
// on this route: a hard ceiling on conversation length and on any single
// message's size, plus a per-IP request rate limit (see rate-limit.ts for
// its documented limitation).
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 2000;

export async function POST(req: Request) {
  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(clientId);
  if (!allowed) {
    return new Response("Too many requests. Please slow down.", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  if (messages.length > MAX_MESSAGES) {
    return new Response("Conversation too long for this demo.", { status: 400 });
  }
  const longestMessageChars = Math.max(
    0,
    ...messages
      .flatMap((m) => m.parts)
      .filter((p) => p.type === "text")
      .map((p) => p.text.length)
  );
  if (longestMessageChars > MAX_MESSAGE_CHARS) {
    return new Response("Message too long for this demo.", { status: 400 });
  }

  const result = streamText({
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: chatTools,
    // After a tool returns, feed the result back and let the model run again
    // (up to 5 steps) so it can call the tool AND then write a sentence.
    stopWhen: stepCountIs(5),
    // Propagates the client's abort (Stop button) to the upstream Groq
    // request itself, instead of just having the client stop listening
    // while generation keeps running server-side.
    abortSignal: req.signal,
  });

  // By default the SDK masks tool errors as "An error occurred." so servers
  // don't leak internals. Our tool throws deliberately user-facing messages
  // (e.g. `No UniProt entry found for "x".`), so forward them to the error card.
  return result.toUIMessageStreamResponse({
    onError: (error) => (error instanceof Error ? error.message : "Lookup failed."),
  });
}

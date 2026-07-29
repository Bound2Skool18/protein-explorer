import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/services/chat-config";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    // Propagates the client's abort (Stop button) to the upstream Groq
    // request itself, instead of just having the client stop listening
    // while generation keeps running server-side.
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}

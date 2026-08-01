import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/services/chat-config";
import { chatTools } from "@/services/chat-tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

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

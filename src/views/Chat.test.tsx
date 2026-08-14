import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useChat } from "@ai-sdk/react";
import { Chat } from "./Chat";
import type { ChatMessage } from "@/services/chat-tools";

// Never call the real AI route: useChat is mocked per-test to return fixed
// state, so Chat.tsx's fetch to /api/chat is never exercised.
vi.mock("@ai-sdk/react", () => ({ useChat: vi.fn() }));

// useChat's return type is parametrized by the message type, but vi.mocked()
// can't infer that generic instantiation from the bare function reference --
// this cast just tells the mock plumbing to expect our ChatMessage shape.
const mockedUseChat = vi.mocked(useChat) as unknown as {
  mockReturnValue: (value: ReturnType<typeof useChat<ChatMessage>>) => void;
};

function mockChat(overrides: Partial<ReturnType<typeof useChat<ChatMessage>>>) {
  mockedUseChat.mockReturnValue({
    messages: [],
    sendMessage: vi.fn(),
    status: "ready",
    stop: vi.fn(),
    error: undefined,
    regenerate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useChat<ChatMessage>>);
}

function userText(id: string, text: string): ChatMessage {
  return { id, role: "user", parts: [{ type: "text", text }] };
}

function assistantText(id: string, text: string): ChatMessage {
  return { id, role: "assistant", parts: [{ type: "text", text }] };
}

describe("Chat", () => {
  it("renders the empty state with clickable example prompts", () => {
    mockChat({});
    render(<Chat />);
    expect(
      screen.getByText(/ask about a protein, a gene, or molecular biology/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "What is insulin?" })).toBeInTheDocument();
  });

  it("renders user and assistant text messages", () => {
    mockChat({ messages: [userText("1", "What is insulin?"), assistantText("2", "A hormone.")] });
    render(<Chat />);
    expect(screen.getByText("What is insulin?")).toBeInTheDocument();
    expect(screen.getByText("A hormone.")).toBeInTheDocument();
  });

  it("shows the thinking indicator while pending (status: submitted)", () => {
    // useChat appends an empty assistant placeholder message as soon as a
    // request is submitted, before any tokens have streamed in.
    mockChat({
      status: "submitted",
      messages: [userText("1", "hi"), assistantText("2", "")],
    });
    render(<Chat />);
    expect(screen.getByLabelText("Assistant is thinking")).toBeInTheDocument();
  });

  it("shows the thinking indicator while streaming with no content yet", () => {
    mockChat({
      status: "streaming",
      messages: [userText("1", "hi"), assistantText("2", "")],
    });
    render(<Chat />);
    expect(screen.getByLabelText("Assistant is thinking")).toBeInTheDocument();
  });

  it("hides the thinking indicator once streamed text has content", () => {
    mockChat({
      status: "streaming",
      messages: [userText("1", "hi"), assistantText("2", "A hor")],
    });
    render(<Chat />);
    expect(screen.queryByLabelText("Assistant is thinking")).not.toBeInTheDocument();
    expect(screen.getByText("A hor")).toBeInTheDocument();
  });

  it("shows a designed error card with a Retry button on status: error, and retries on click", async () => {
    const regenerate = vi.fn();
    mockChat({ status: "error", error: new Error("boom"), regenerate });
    render(<Chat />);

    const alert = screen.getByText("Couldn't get a reply");
    expect(alert).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryButton);
    expect(regenerate).toHaveBeenCalledTimes(1);
  });

  it("renders all four tool-lookupProtein lifecycle states distinctly", () => {
    const message: ChatMessage = {
      id: "1",
      role: "assistant",
      parts: [
        { type: "tool-lookupProtein", toolCallId: "a", state: "input-streaming", input: undefined },
        { type: "text", text: "" },
      ],
    };
    mockChat({ messages: [message] });
    render(<Chat />);
    expect(screen.getByText("Preparing protein lookup…")).toBeInTheDocument();
  });

  it("renders the running tool state with the query", () => {
    const message: ChatMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-lookupProtein",
          toolCallId: "a",
          state: "input-available",
          input: { query: "insulin" },
        },
      ],
    };
    mockChat({ messages: [message] });
    render(<Chat />);
    expect(screen.getByText(/looking up/i)).toBeInTheDocument();
    expect(screen.getByText("insulin")).toBeInTheDocument();
  });

  it("renders a successful tool result as a ProteinResultCard", () => {
    const message: ChatMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-lookupProtein",
          toolCallId: "a",
          state: "output-available",
          input: { query: "insulin" },
          output: {
            accession: "P01308",
            id: "INS_HUMAN",
            name: "Insulin",
            organism: "Homo sapiens",
            genes: ["INS"],
            function: "Regulates glucose metabolism.",
          },
        },
      ],
    };
    mockChat({ messages: [message] });
    render(<Chat />);
    expect(screen.getByRole("heading", { name: "Insulin" })).toBeInTheDocument();
  });

  it("renders the tool error state with the server's error message", () => {
    const message: ChatMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-lookupProtein",
          toolCallId: "a",
          state: "output-error",
          input: { query: "xyz" },
          errorText: 'No UniProt entry found for "xyz".',
        },
      ],
    };
    mockChat({ messages: [message] });
    render(<Chat />);
    expect(screen.getByText('No UniProt entry found for "xyz".')).toBeInTheDocument();
  });

  it("sends the typed message and clears the input on submit", async () => {
    const sendMessage = vi.fn();
    mockChat({ sendMessage });
    render(<Chat />);

    const input = screen.getByLabelText("Message");
    await userEvent.type(input, "What is BRCA1?");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(sendMessage).toHaveBeenCalledWith({ text: "What is BRCA1?" });
    expect(input).toHaveValue("");
  });
});

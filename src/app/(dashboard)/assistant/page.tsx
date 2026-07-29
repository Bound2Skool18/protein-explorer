import { Chat } from "@/views/Chat";

export default function AssistantPage() {
  return (
    <section>
      <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Assistant</h2>
      <p className="text-on-surface-variant mb-6">
        Ask questions about proteins, genes, and molecular biology.
      </p>
      <Chat />
    </section>
  );
}

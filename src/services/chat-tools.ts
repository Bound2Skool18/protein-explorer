import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { searchProteins } from "./uniprot";

// FE-07: a server-side tool the chat model can call. The model never runs this
// code -- it emits a *request* to call it; the AI SDK runs `execute` on the
// server and streams the result back as a typed tool part the UI renders.
export const lookupProtein = tool({
  // The model reads this to decide *whether* to call the tool. Write it like a
  // doc comment aimed at the model.
  description:
    "Look up a single protein in UniProt by name, gene symbol, or keyword " +
    "(e.g. 'insulin', 'BRCA1', 'hemoglobin'). Call this when the user asks " +
    "about a specific protein so the app can show its real UniProt data.",

  // The input contract. Every field is something the model must fill -- and can
  // hallucinate -- so keep it minimal. `.describe()` doubles as model guidance.
  inputSchema: z.object({
    query: z.string().describe("The protein name, gene symbol, or keyword to look up."),
  }),

  // The real work. Return value's shape = what the UI renders (output-available).
  // Throwing here is what produces the output-error state -- by design, not a bug.
  execute: async ({ query }) => {
    const results = await searchProteins(query, 1);
    if (results.length === 0) {
      throw new Error(`No UniProt entry found for "${query}".`);
    }
    return results[0]; // a Protein: { accession, id, name, organism, genes[], function }
  },
});

export const chatTools = { lookupProtein };

// Infer strong types from the tools so `part.input` / `part.output` are typed
// (not `any`) everywhere the chat renders tool parts.
export type ChatTools = InferUITools<typeof chatTools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

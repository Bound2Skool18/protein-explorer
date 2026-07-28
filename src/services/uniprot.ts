import type { Protein } from "../models/Protein";

const SEARCH_URL = "https://rest.uniprot.org/uniprotkb/search";
const FIELDS = "accession,id,protein_name,gene_names,organism_name,cc_function";

type UniProtEntry = {
  primaryAccession: string;
  uniProtkbId: string;
  proteinDescription?: {
    recommendedName?: { fullName?: { value?: string } };
    submissionNames?: { fullName?: { value?: string } }[];
  };
  organism?: { scientificName?: string };
  genes?: { geneName?: { value?: string } }[];
  comments?: { commentType: string; texts?: { value?: string }[] }[];
};

type UniProtSearchResponse = { results: UniProtEntry[] };

function toProtein(entry: UniProtEntry): Protein {
  const name =
    entry.proteinDescription?.recommendedName?.fullName?.value ??
    entry.proteinDescription?.submissionNames?.[0]?.fullName?.value ??
    entry.uniProtkbId;

  const functionComment = entry.comments?.find((c) => c.commentType === "FUNCTION");

  return {
    accession: entry.primaryAccession,
    id: entry.uniProtkbId,
    name,
    organism: entry.organism?.scientificName ?? "Unknown organism",
    genes: (entry.genes ?? [])
      .map((g) => g.geneName?.value)
      .filter((v): v is string => Boolean(v)),
    function: functionComment?.texts?.[0]?.value ?? null,
  };
}

export async function searchProteins(query: string, limit = 12): Promise<Protein[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("format", "json");
  url.searchParams.set("size", String(limit));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`UniProt search failed: ${res.status}`);
  }
  const data: UniProtSearchResponse = await res.json();
  return data.results.map(toProtein);
}

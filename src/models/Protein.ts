export type Protein = {
  accession: string;
  id: string;
  name: string;
  organism: string;
  genes: string[];
  function: string | null;
};

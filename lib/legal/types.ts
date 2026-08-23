export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type LegalDoc = {
  title: string;
  effective: string | null;
  version: string | null;
  blocks: LegalBlock[];
};

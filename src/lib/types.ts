export type ClaimKind = "fact" | "quote" | "number" | "analogy" | "definition" | "transition" | "analysis";

export interface Citation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  date?: string; // ISO date of the source
}

/** One sentence of a story. Facts, quotes and numbers must point to a citation. */
export interface Claim {
  text: string;
  kind: ClaimKind;
  cite?: string; // Citation id
}

export interface Perspective {
  who: string;
  role: string;
  view: string;
  cite?: string;
}

export interface EvidenceCard {
  quote: string;
  highlight: string; // part of the quote to mark
  attribution: string;
  cite: string;
  figures: { value: string; label: string }[];
}

export interface Story {
  slug: string;
  slot: "must_know" | "quick_hit" | "niche_find" | "your_topic";
  sector: string;
  region: string;
  headline: string;
  brief: Claim[];
  understand?: {
    what: Claim[];
    whyItMatters: Claim[];
    analogy: Claim;
    notProven: Claim[];
  };
  card?: EvidenceCard;
  perspectives?: Perspective[];
  citations: Citation[];
  readMinutes: number;
  importance: number;
  placeholder?: boolean; // sample content, not a real event
}

export interface Deal {
  company: string;
  round: string;
  amount: string;
  lead: string;
  sector: string;
  country: string;
  confidence: "confirmed" | "single_report" | "conflicting";
  placeholder?: boolean;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export interface Lesson {
  track: string;
  number: number;
  week: number;
  title: string;
  minutes: number;
  concept: string;
  analogy: string;
  now: string;
  quiz: { prompt: string; options: string[]; answer: number; explanation: string }[];
}

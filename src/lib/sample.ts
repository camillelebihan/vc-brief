// SAMPLE DATA for milestone 1 (screens only).
// - The Barclays story uses facts and sources cited in a Meridal post (Barclays results
//   of 22 Oct 2026, Anthropic release of 1 Oct 2026, Reuters 19 May 2026, dpa 15 May 2026).
//   Citation URLs point to publisher landing pages until the pipeline stores exact links.
// - Everything flagged `placeholder: true` is invented to show the layout. It is not news.
import type { Deal, GlossaryTerm, Lesson, Story } from "./types";

export const EDITION = {
  kind: "morning" as const,
  date: "2026-11-02",
  label: "Monday 2 November",
  readMinutes: 10,
};

export const STORIES: Story[] = [
  {
    slug: "barclays-ai-support-cuts",
    slot: "must_know",
    sector: "AI",
    region: "UK",
    headline: "Barclays cuts about 5,000 jobs and names AI as one reason",
    importance: 84,
    readMinutes: 4,
    brief: [
      { text: "Barclays plans to cut about 5,000 full-time roles, roughly 5% of staff.", kind: "number", cite: "barclays-slides" },
      { text: "About 60% of the measures hit support functions, developers included.", kind: "number", cite: "barclays-slides" },
      { text: "The bank expects more than £1.1bn of gross savings in 2027.", kind: "number", cite: "barclays-speech" },
    ],
    understand: {
      what: [
        { text: "On 22 October, Barclays' CFO Anna Cross told analysts the cuts include fewer developers because AI makes staff more productive.", kind: "fact", cite: "barclays-speech" },
        { text: "In the same speech, CEO C. S. Venkatakrishnan said most gains come from simplifying data, infrastructure and processes, with AI on top.", kind: "fact", cite: "barclays-speech" },
        { text: "Three weeks earlier, Anthropic said Barclays expects half its developers to use Claude Code by the end of 2026.", kind: "fact", cite: "anthropic-release" },
        { text: "Neither company links the two announcements.", kind: "analysis" },
      ],
      whyItMatters: [
        { text: "Banks are starting to put AI into cost plans with a number attached, which turns AI adoption into a line investors can track.", kind: "analysis" },
        { text: "Standard Chartered plans to cut 15% of central-function roles by 2030, starting with back-office centres.", kind: "fact", cite: "reuters-stanchart" },
        { text: "Commerzbank announced about 3,000 cuts in May, notably in call centres and outsourced IT.", kind: "fact", cite: "dpa-commerzbank" },
        { text: "For startups selling AI tools to banks, budgets may move from headcount to software.", kind: "analysis" },
      ],
      analogy: {
        text: "Think of a restaurant that redoes its kitchen: the new ovens (AI) get the headlines, but most of the savings come from the new layout (data, systems, processes).",
        kind: "analogy",
      },
      notProven: [
        { text: "How many of the 5,000 roles are caused by AI rather than reorganisation: Barclays does not split the figure.", kind: "fact", cite: "barclays-slides" },
        { text: "The cuts still depend on employee consultation, and the union Unite calls AI a pretext.", kind: "fact", cite: "barclays-speech" },
      ],
    },
    card: {
      quote: "Around 60% of the Group actions relate to support functions, including fewer developers as AI makes our people more productive.",
      highlight: "fewer developers as AI makes our people more productive",
      attribution: "Anna Cross, CFO, Barclays results speech, 22 Oct 2026",
      cite: "barclays-speech",
      figures: [
        { value: "≈5,000", label: "roles, about 5% of staff" },
        { value: "≈60%", label: "of measures in support functions" },
        { value: "£1.1bn+", label: "gross savings expected in 2027" },
      ],
    },
    perspectives: [
      { who: "Anna Cross", role: "CFO, Barclays", view: "Cites both organisational simplification and the first effects of AI, and calls these actions much heavier than previous ones.", cite: "barclays-speech" },
      { who: "C. S. Venkatakrishnan", role: "CEO, Barclays", view: "AI is the icing on the cake, not the cake: the base is standardised data, modern infrastructure and harmonised processes.", cite: "barclays-speech" },
      { who: "Unite", role: "Trade union", view: "Calls the AI rationale a pretext for cuts.", cite: "barclays-speech" },
    ],
    citations: [
      { id: "barclays-speech", title: "Q3 2026 results — management speech", publisher: "Barclays", url: "https://home.barclays/investor-relations/", date: "2026-10-22" },
      { id: "barclays-slides", title: "Q3 2026 results — slide 10", publisher: "Barclays", url: "https://home.barclays/investor-relations/", date: "2026-10-22" },
      { id: "anthropic-release", title: "Barclays extends Claude across the bank", publisher: "Anthropic", url: "https://www.anthropic.com/news", date: "2026-10-01" },
      { id: "reuters-stanchart", title: "Standard Chartered to cut central-function roles", publisher: "Reuters", url: "https://www.reuters.com/", date: "2026-05-19" },
      { id: "dpa-commerzbank", title: "Commerzbank to cut about 3,000 jobs", publisher: "dpa via blue News", url: "https://www.bluewin.ch/", date: "2026-05-15" },
    ],
  },
  {
    slug: "placeholder-fusion-series-b",
    slot: "must_know",
    sector: "Deeptech",
    region: "EU",
    headline: "Placeholder: a European fusion startup raises a large Series B",
    importance: 78,
    readMinutes: 3,
    placeholder: true,
    brief: [
      { text: "Sample story showing how a deeptech deal will look. Real stories arrive at milestone 2.", kind: "transition" },
    ],
    citations: [],
  },
  {
    slug: "placeholder-ecb-rates",
    slot: "must_know",
    sector: "Macro",
    region: "EU",
    headline: "Placeholder: what the ECB's next rate decision means for late-stage rounds",
    importance: 72,
    readMinutes: 3,
    placeholder: true,
    brief: [{ text: "Sample story slot for a macro Must-know.", kind: "transition" }],
    citations: [],
  },
  ...[
    "Placeholder: a Paris AI startup opens a US office",
    "Placeholder: a US growth fund closes a new vehicle",
    "Placeholder: an EU rule on AI models takes effect",
  ].map((headline, i): Story => ({
    slug: `placeholder-quick-${i + 1}`,
    slot: "quick_hit",
    sector: ["AI", "VC", "Policy"][i],
    region: ["FR", "US", "EU"][i],
    headline,
    importance: 60 - i * 4,
    readMinutes: 1,
    placeholder: true,
    brief: [{ text: "Two-line summary in our own words, with a link to the original.", kind: "transition" }],
    citations: [],
  })),
  ...[
    "Placeholder: a three-person lab publishes a cheaper way to make solid-state electrolytes",
    "Placeholder: a pre-seed round in agricultural robotics with an unusual investor mix",
  ].map((headline, i): Story => ({
    slug: `placeholder-niche-${i + 1}`,
    slot: "niche_find",
    sector: ["Deeptech", "Robotics"][i],
    region: ["GLOBAL", "EU"][i],
    headline,
    importance: 45,
    readMinutes: 2,
    placeholder: true,
    brief: [{ text: "Small but early signal, picked for novelty rather than size.", kind: "transition" }],
    citations: [],
  })),
  ...[
    "Placeholder: a medtech startup gets CE marking for an AI diagnostic tool",
    "Placeholder: what new preprints say about protein design",
  ].map((headline, i): Story => ({
    slug: `placeholder-topic-${i + 1}`,
    slot: "your_topic",
    sector: "Medtech",
    region: "EU",
    headline,
    importance: 50,
    readMinutes: 2,
    placeholder: true,
    brief: [{ text: "Shown only to readers who picked this topic.", kind: "transition" }],
    citations: [],
  })),
];

export const DEALS: Deal[] = [
  { company: "Placeholder Robotics", round: "Series A", amount: "€18M", lead: "Example Ventures", sector: "Robotics", country: "FR", confidence: "confirmed", placeholder: true },
  { company: "Sample Bio", round: "Seed", amount: "$6M", lead: "Demo Capital", sector: "Biotech", country: "US", confidence: "single_report", placeholder: true },
  { company: "Mock Energy", round: "Series B", amount: "€40M", lead: "Test Partners", sector: "Climate", country: "DE", confidence: "conflicting", placeholder: true },
];

export const GLOSSARY: Record<string, GlossaryTerm> = {
  FTE: { term: "FTE", definition: "Full-time equivalent: a way to count staff where two half-time jobs equal one FTE.", example: "5,000 FTE can be more than 5,000 people if some work part-time." },
  "support functions": { term: "Support functions", definition: "Teams that keep a company running but don't serve clients directly: IT, operations, HR, finance, back office." },
  "gross savings": { term: "Gross savings", definition: "Costs removed before subtracting what it costs to achieve them, such as severance or new software." },
  "Series B": { term: "Series B", definition: "A funding round for a startup that has found product-market fit and needs capital to scale, usually after a Series A." },
  "Claude Code": { term: "Claude Code", definition: "Anthropic's AI coding tool that writes and edits software alongside developers." },
};

export const TRACK = {
  id: "vc-foundations",
  title: "VC Foundations",
  weeks: [
    { n: 1, title: "How VC works", lessons: ["What a VC fund is: GPs, LPs, 2 and 20", "Fund life and the J-curve", "The power law", "Stages from pre-seed to growth", "Who LPs are and what they want"] },
    { n: 2, title: "The deal", lessons: ["Pre- and post-money, dilution", "Term sheet anatomy", "Liquidation preferences", "SAFEs, BSA AIR and convertibles", "Cap tables and option pools"] },
    { n: 3, title: "Picking winners", lessons: ["Sourcing and dealflow", "Market sizing done right", "Unit economics: CAC, LTV, NRR", "Due diligence", "Writing an investment memo"] },
    { n: 4, title: "The market now", lessons: ["State of VC today", "Europe vs US ecosystems", "Exits: IPO, M&A, secondaries", "Deeptech and long-horizon funds", "Final: explain your thesis to an LP"] },
  ],
};

export const TODAY_LESSON: Lesson = {
  track: "VC Foundations",
  number: 1,
  week: 1,
  title: "What a VC fund is: GPs, LPs, 2 and 20",
  minutes: 4,
  concept:
    "A venture fund pools money from investors called limited partners (LPs), such as pension funds, insurers and family offices. The fund is run by general partners (GPs), who pick startups and sit on boards. LPs commit money for about ten years; GPs call it in as they find deals.",
  analogy:
    "Picture a group of friends handing a chef a budget for ten years of dinners. The friends (LPs) pay and eat the results; the chef (GP) chooses every ingredient, takes a yearly fee for running the kitchen, and a share of the praise if the meals are great.",
  now: "Milestone 2 fills this part with what is happening now, for example a fund that just closed, cited to its announcement.",
  quiz: [
    { prompt: "Who chooses which startups a fund invests in?", options: ["The LPs", "The GPs", "The startups' founders"], answer: 1, explanation: "GPs run the fund and make the investment decisions; LPs provide most of the money." },
    { prompt: "In \"2 and 20\", what is the 20?", options: ["A yearly fee of 20%", "A 20% share of the fund's profits", "20 startups per fund"], answer: 1, explanation: "Carried interest: GPs typically keep about 20% of profits; the 2% is the yearly management fee." },
    { prompt: "Roughly how long do LPs commit their money to a typical VC fund?", options: ["1 year", "About 10 years", "Forever"], answer: 1, explanation: "Most funds run about ten years, sometimes with extensions, because startups take years to exit." },
  ],
};

export const USER = {
  name: "Camille",
  streakDays: 5,
  weeksInARow: 1,
  badges: ["streak-5"],
  topics: ["VC", "AI", "Deeptech", "Medtech"],
};

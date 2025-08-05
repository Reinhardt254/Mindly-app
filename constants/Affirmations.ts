import { Affirmation } from "./UserTypes";

export const AFFIRMATIONS: Affirmation[] = [
  {
    id: "aff_001",
    text: "I am capable of achieving great things",
    category: "confidence",
    tags: ["achievement", "capability"],
  },
  {
    id: "aff_002",
    text: "Every day is a new opportunity to grow",
    category: "growth",
    tags: ["opportunity", "daily"],
  },
  {
    id: "aff_003",
    text: "I choose to be confident and strong",
    category: "strength",
    tags: ["confidence", "choice"],
  },
  {
    id: "aff_004",
    text: "My potential is limitless",
    category: "motivation",
    tags: ["potential", "limitless"],
  },
  {
    id: "aff_005",
    text: "I am worthy of love and respect",
    category: "self-love",
    tags: ["worthy", "love", "respect"],
  },
  {
    id: "aff_006",
    text: "I trust in my abilities and decisions",
    category: "confidence",
    tags: ["trust", "abilities", "decisions"],
  },
  {
    id: "aff_007",
    text: "I am becoming better every single day",
    category: "growth",
    tags: ["improvement", "daily"],
  },
  {
    id: "aff_008",
    text: "My thoughts create my reality",
    category: "motivation",
    tags: ["mindset", "reality"],
  },
  {
    id: "aff_009",
    text: "I am in control of my happiness",
    category: "self-love",
    tags: ["control", "happiness"],
  },
  {
    id: "aff_010",
    text: "I attract positive energy and good vibes",
    category: "motivation",
    tags: ["positive", "energy"],
  },
  {
    id: "aff_011",
    text: "I am resilient and can handle any challenge",
    category: "strength",
    tags: ["resilient", "challenge"],
  },
  {
    id: "aff_012",
    text: "My future is bright and full of possibilities",
    category: "motivation",
    tags: ["future", "possibilities"],
  },
  {
    id: "aff_013",
    text: "I am surrounded by love and support",
    category: "gratitude",
    tags: ["love", "support"],
  },
  {
    id: "aff_014",
    text: "I am exactly where I need to be right now",
    category: "self-love",
    tags: ["present", "acceptance"],
  },
  {
    id: "aff_015",
    text: "I radiate confidence and inner peace",
    category: "confidence",
    tags: ["confidence", "peace"],
  },
  {
    id: "aff_016",
    text: "Every challenge makes me stronger",
    category: "strength",
    tags: ["challenge", "growth"],
  },
  {
    id: "aff_017",
    text: "I am grateful for all that I have",
    category: "gratitude",
    tags: ["gratitude", "appreciation"],
  },
  {
    id: "aff_018",
    text: "I am creating the life I want to live",
    category: "motivation",
    tags: ["creation", "life"],
  },
  {
    id: "aff_019",
    text: "I am enough, just as I am",
    category: "self-love",
    tags: ["enough", "acceptance"],
  },
  {
    id: "aff_020",
    text: "I believe in myself and my dreams",
    category: "confidence",
    tags: ["belief", "dreams"],
  },
];

export const CATEGORIES = {
  confidence: "Confidence",
  gratitude: "Gratitude",
  strength: "Strength",
  growth: "Growth",
  "self-love": "Self-Love",
  motivation: "Motivation",
} as const;

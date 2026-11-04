export const MOODS = [
  "happy",
  "calm",
  "grateful",
  "tired",
  "anxious",
  "stressed",
  "sad",
  "angry",
] as const;

export type Mood = (typeof MOODS)[number];

export interface CategorySeed {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isPremium: boolean;
  sortOrder: number;
}

export interface AffirmationSeed {
  id: string;
  text: string;
  categoryId: string;
  moods: Mood[];
  tags?: string[];
}

export const CATEGORY_SEEDS: CategorySeed[] = [
  { id: "confidence", name: "Confidence", icon: "shield-checkmark", color: "#3B82F6", description: "Build self-confidence and belief", isPremium: false, sortOrder: 1 },
  { id: "gratitude", name: "Gratitude", icon: "heart", color: "#EC4899", description: "Practice thankfulness and appreciation", isPremium: false, sortOrder: 2 },
  { id: "calm", name: "Calm", icon: "leaf", color: "#14B8A6", description: "Slow down and find your peace", isPremium: false, sortOrder: 3 },
  { id: "motivation", name: "Motivation", icon: "flame", color: "#F97316", description: "Stay motivated and driven", isPremium: false, sortOrder: 4 },
  { id: "self-love", name: "Self Love", icon: "sparkles", color: "#F59E0B", description: "Nurture self-acceptance and love", isPremium: false, sortOrder: 5 },
  { id: "strength", name: "Strength", icon: "fitness", color: "#EF4444", description: "Find inner strength and resilience", isPremium: false, sortOrder: 6 },
  { id: "growth", name: "Growth", icon: "trending-up", color: "#10B981", description: "Embrace personal development", isPremium: false, sortOrder: 7 },
  { id: "anxiety", name: "Anxiety Relief", icon: "cloud", color: "#6366F1", description: "Ease worry and come back to the present", isPremium: true, sortOrder: 20 },
  { id: "career", name: "Career", icon: "briefcase", color: "#0EA5E9", description: "Show up with purpose at work", isPremium: true, sortOrder: 21 },
  { id: "relationships", name: "Relationships", icon: "people", color: "#DB2777", description: "Build connection and healthy boundaries", isPremium: true, sortOrder: 22 },
  { id: "self-worth", name: "Self-Worth", icon: "diamond", color: "#A855F7", description: "Know your value", isPremium: true, sortOrder: 23 },
  { id: "exam-stress", name: "Exam Stress", icon: "school", color: "#84CC16", description: "Stay steady before and during exams", isPremium: true, sortOrder: 30 },
  { id: "new-parents", name: "New Parents", icon: "happy", color: "#F472B6", description: "Patience and love for the early days", isPremium: true, sortOrder: 31 },
  { id: "entrepreneurs", name: "Entrepreneurs", icon: "rocket", color: "#F59E0B", description: "Courage for builders and founders", isPremium: true, sortOrder: 32 },
  { id: "healing", name: "Healing", icon: "bandage", color: "#22C55E", description: "Gentle words for hard seasons", isPremium: true, sortOrder: 33 },
];

export const AFFIRMATION_SEEDS: AffirmationSeed[] = [
  { id: "aff_001", text: "I am capable of achieving great things", categoryId: "confidence", moods: ["happy", "tired"], tags: ["achievement", "capability"] },
  { id: "aff_002", text: "Every day is a new opportunity to grow", categoryId: "growth", moods: ["sad", "tired"], tags: ["opportunity", "daily"] },
  { id: "aff_003", text: "I choose to be confident and strong", categoryId: "strength", moods: ["anxious", "stressed"], tags: ["confidence", "choice"] },
  { id: "aff_004", text: "My potential is limitless", categoryId: "motivation", moods: ["happy"], tags: ["potential", "limitless"] },
  { id: "aff_005", text: "I am worthy of love and respect", categoryId: "self-love", moods: ["sad", "angry"], tags: ["worthy", "love", "respect"] },
  { id: "aff_006", text: "I trust in my abilities and decisions", categoryId: "confidence", moods: ["anxious"], tags: ["trust", "abilities", "decisions"] },
  { id: "aff_007", text: "I am becoming better every single day", categoryId: "growth", moods: ["happy", "tired"], tags: ["improvement", "daily"] },
  { id: "aff_008", text: "My thoughts create my reality", categoryId: "motivation", moods: ["calm"], tags: ["mindset", "reality"] },
  { id: "aff_009", text: "I am in control of my happiness", categoryId: "self-love", moods: ["sad", "angry"], tags: ["control", "happiness"] },
  { id: "aff_010", text: "I attract positive energy and good vibes", categoryId: "motivation", moods: ["happy", "grateful"], tags: ["positive", "energy"] },
  { id: "aff_011", text: "I am resilient and can handle any challenge", categoryId: "strength", moods: ["stressed", "anxious"], tags: ["resilient", "challenge"] },
  { id: "aff_012", text: "My future is bright and full of possibilities", categoryId: "motivation", moods: ["sad", "happy"], tags: ["future", "possibilities"] },
  { id: "aff_013", text: "I am surrounded by love and support", categoryId: "gratitude", moods: ["grateful", "sad"], tags: ["love", "support"] },
  { id: "aff_014", text: "I am exactly where I need to be right now", categoryId: "self-love", moods: ["calm", "anxious"], tags: ["present", "acceptance"] },
  { id: "aff_015", text: "I radiate confidence and inner peace", categoryId: "confidence", moods: ["calm", "happy"], tags: ["confidence", "peace"] },
  { id: "aff_016", text: "Every challenge makes me stronger", categoryId: "strength", moods: ["stressed", "angry"], tags: ["challenge", "growth"] },
  { id: "aff_017", text: "I am grateful for all that I have", categoryId: "gratitude", moods: ["grateful", "calm"], tags: ["gratitude", "appreciation"] },
  { id: "aff_018", text: "I am creating the life I want to live", categoryId: "motivation", moods: ["happy"], tags: ["creation", "life"] },
  { id: "aff_019", text: "I am enough, just as I am", categoryId: "self-love", moods: ["sad", "anxious"], tags: ["enough", "acceptance"] },
  { id: "aff_020", text: "I believe in myself and my dreams", categoryId: "confidence", moods: ["happy", "tired"], tags: ["belief", "dreams"] },

  { id: "aff_021", text: "I breathe in calm and breathe out tension", categoryId: "calm", moods: ["stressed", "anxious", "angry"] },
  { id: "aff_022", text: "I can slow down and still move forward", categoryId: "calm", moods: ["stressed", "tired"] },
  { id: "aff_023", text: "Peace begins with this breath", categoryId: "calm", moods: ["anxious", "angry"] },
  { id: "aff_024", text: "I let go of what I cannot control", categoryId: "calm", moods: ["anxious", "stressed", "angry"] },
  { id: "aff_025", text: "My mind is quiet and my body is relaxed", categoryId: "calm", moods: ["tired", "calm"] },
  { id: "aff_026", text: "I give myself permission to rest", categoryId: "calm", moods: ["tired", "stressed"] },
  { id: "aff_027", text: "Small joys fill my day", categoryId: "gratitude", moods: ["grateful", "happy"] },
  { id: "aff_028", text: "I notice the good things around me", categoryId: "gratitude", moods: ["grateful", "sad"] },
  { id: "aff_029", text: "Today I choose to be thankful", categoryId: "gratitude", moods: ["grateful", "angry"] },
  { id: "aff_030", text: "I speak to myself with kindness", categoryId: "self-love", moods: ["sad", "angry"] },
  { id: "aff_031", text: "My feelings are valid and I honour them", categoryId: "self-love", moods: ["sad", "anxious", "angry"] },
  { id: "aff_032", text: "I show up for myself, one step at a time", categoryId: "motivation", moods: ["tired", "sad"] },
  { id: "aff_033", text: "Progress, not perfection", categoryId: "motivation", moods: ["stressed", "tired"] },
  { id: "aff_034", text: "I have survived hard days before and I will again", categoryId: "strength", moods: ["sad", "stressed"] },
  { id: "aff_035", text: "My voice matters", categoryId: "confidence", moods: ["anxious", "angry"] },

  { id: "aff_101", text: "This feeling is temporary and I am safe", categoryId: "anxiety", moods: ["anxious"] },
  { id: "aff_102", text: "I am bigger than my worries", categoryId: "anxiety", moods: ["anxious", "stressed"] },
  { id: "aff_103", text: "I return to the present moment whenever I need to", categoryId: "anxiety", moods: ["anxious", "calm"] },
  { id: "aff_104", text: "I bring real value to my work", categoryId: "career", moods: ["anxious", "happy"] },
  { id: "aff_105", text: "I am ready for the opportunities coming my way", categoryId: "career", moods: ["happy", "stressed"] },
  { id: "aff_106", text: "My growth at work is steady and real", categoryId: "career", moods: ["tired", "stressed"] },
  { id: "aff_107", text: "I give and receive love freely", categoryId: "relationships", moods: ["grateful", "happy"] },
  { id: "aff_108", text: "My boundaries are a form of self-respect", categoryId: "relationships", moods: ["angry", "stressed"] },
  { id: "aff_109", text: "I attract people who value me", categoryId: "relationships", moods: ["sad", "happy"] },
  { id: "aff_110", text: "My worth is not measured by my productivity", categoryId: "self-worth", moods: ["tired", "sad"] },
  { id: "aff_111", text: "I deserve good things", categoryId: "self-worth", moods: ["sad", "grateful"] },
  { id: "aff_112", text: "I prepared well and I trust my memory", categoryId: "exam-stress", moods: ["anxious", "stressed"] },
  { id: "aff_113", text: "One question at a time, I've got this", categoryId: "exam-stress", moods: ["anxious", "stressed"] },
  { id: "aff_114", text: "My result does not define my worth", categoryId: "exam-stress", moods: ["sad", "anxious"] },
  { id: "aff_115", text: "I am learning alongside my baby", categoryId: "new-parents", moods: ["tired", "stressed"] },
  { id: "aff_116", text: "I am the right parent for my child", categoryId: "new-parents", moods: ["anxious", "sad"] },
  { id: "aff_117", text: "Rest is part of caring for my family", categoryId: "new-parents", moods: ["tired"] },
  { id: "aff_118", text: "Every setback teaches me something my business needs", categoryId: "entrepreneurs", moods: ["stressed", "sad"] },
  { id: "aff_119", text: "I build with courage and patience", categoryId: "entrepreneurs", moods: ["anxious", "happy"] },
  { id: "aff_120", text: "I am allowed to take up space in the market", categoryId: "entrepreneurs", moods: ["anxious"] },
  { id: "aff_121", text: "Healing is not linear, and that's okay", categoryId: "healing", moods: ["sad", "tired"] },
  { id: "aff_122", text: "I am gentle with myself as I heal", categoryId: "healing", moods: ["sad", "angry"] },
  { id: "aff_123", text: "Each day I grow a little lighter", categoryId: "healing", moods: ["sad", "calm"] },
];

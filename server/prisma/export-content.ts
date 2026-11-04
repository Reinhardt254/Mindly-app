import { writeFileSync } from "fs";
import { join } from "path";
import { AFFIRMATION_SEEDS, CATEGORY_SEEDS, MOODS } from "./content";

// Writes the free content bundled into the app as the offline fallback.
const premium = new Set(CATEGORY_SEEDS.filter((c) => c.isPremium).map((c) => c.id));

const out = {
  moods: MOODS,
  categories: CATEGORY_SEEDS,
  affirmations: AFFIRMATION_SEEDS.filter((a) => !premium.has(a.categoryId)),
};

const target = join(__dirname, "..", "..", "app", "constants", "affirmationContent.json");
writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.affirmations.length} affirmations to ${target}`);

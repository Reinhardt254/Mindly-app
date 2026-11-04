import "../src/load-env";
import { PrismaClient } from "@prisma/client";
import { AFFIRMATION_SEEDS, CATEGORY_SEEDS } from "./content";

const prisma = new PrismaClient();

async function main() {
  for (const category of CATEGORY_SEEDS) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: category,
      update: category,
    });
  }

  const premiumCategories = new Set(
    CATEGORY_SEEDS.filter((c) => c.isPremium).map((c) => c.id)
  );

  for (const a of AFFIRMATION_SEEDS) {
    const data = {
      text: a.text,
      categoryId: a.categoryId,
      moods: a.moods,
      tags: a.tags ?? [],
      isPremium: premiumCategories.has(a.categoryId),
      lang: "en",
    };
    await prisma.affirmation.upsert({
      where: { id: a.id },
      create: { id: a.id, ...data },
      update: data,
    });
  }

  console.log(
    `Seeded ${CATEGORY_SEEDS.length} categories and ${AFFIRMATION_SEEDS.length} affirmations`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

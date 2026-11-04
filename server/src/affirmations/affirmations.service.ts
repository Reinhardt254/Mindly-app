import { Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PremiumService } from "../premium/premium.service";

const SELECT = {
  id: true,
  text: true,
  categoryId: true,
  moods: true,
  tags: true,
  isPremium: true,
  lang: true,
} satisfies Prisma.AffirmationSelect;

export type AffirmationDto = Prisma.AffirmationGetPayload<{ select: typeof SELECT }>;

export interface ListFilter {
  category?: string;
  mood?: string;
  lang?: string;
}

@Injectable()
export class AffirmationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly premium: PremiumService,
  ) {}

  private async accessWhere(userId: string | undefined, filter: ListFilter): Promise<Prisma.AffirmationWhereInput> {
    const isPremium = userId ? await this.premium.isPremium(userId) : false;
    return {
      lang: filter.lang ?? "en",
      ...(isPremium ? {} : { isPremium: false }),
      ...(filter.category ? { categoryId: filter.category } : {}),
      ...(filter.mood ? { moods: { has: filter.mood } } : {}),
    };
  }

  async categories(userId?: string) {
    const [categories, isPremium] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { affirmations: true } } },
      }),
      userId ? this.premium.isPremium(userId) : Promise.resolve(false),
    ]);
    return categories.map(({ _count, ...c }) => ({
      ...c,
      count: _count.affirmations,
      locked: c.isPremium && !isPremium,
    }));
  }

  async list(userId: string | undefined, filter: ListFilter): Promise<AffirmationDto[]> {
    return this.prisma.affirmation.findMany({
      where: await this.accessWhere(userId, filter),
      select: SELECT,
      orderBy: { id: "asc" },
    });
  }

  async random(userId: string | undefined, filter: ListFilter): Promise<AffirmationDto | null> {
    const items = await this.list(userId, filter);
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  /** Same affirmation for a given user and calendar day. */
  async daily(userId: string | undefined, date: string, lang?: string): Promise<AffirmationDto> {
    const items = await this.list(userId, { lang });
    if (items.length === 0) throw new NotFoundException("No affirmations available");
    const hash = createHash("sha256").update(`${userId ?? "anon"}:${date}`).digest();
    return items[hash.readUInt32BE(0) % items.length];
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "crypto";
import { Prisma } from "../generated/prisma/client";
import { PremiumService } from "../premium/premium.service";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

const IMAGE_URL_TTL = 60 * 60 * 24;

const SELECT = {
  id: true,
  text: true,
  categoryId: true,
  moods: true,
  tags: true,
  isPremium: true,
  lang: true,
  imageKey: true,
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
    private readonly storage: StorageService,
  ) {}

  private async withImageUrl<T extends { imageKey: string | null }>(row: T) {
    const { imageKey, ...rest } = row;
    return { ...rest, imageUrl: imageKey ? await this.storage.downloadUrl(imageKey, IMAGE_URL_TTL) : null };
  }

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
    return Promise.all(
      categories.map(async ({ _count, ...category }) => ({
        ...(await this.withImageUrl(category)),
        count: _count.affirmations,
        locked: category.isPremium && !isPremium,
      })),
    );
  }

  async list(userId: string | undefined, filter: ListFilter) {
    const items = await this.prisma.affirmation.findMany({
      where: await this.accessWhere(userId, filter),
      select: SELECT,
      orderBy: { id: "asc" },
    });
    return Promise.all(items.map((item) => this.withImageUrl(item)));
  }

  async random(userId: string | undefined, filter: ListFilter) {
    const items = await this.list(userId, filter);
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  /** Same affirmation for a given user and calendar day. */
  async daily(userId: string | undefined, date: string, lang?: string) {
    const items = await this.list(userId, { lang });
    if (items.length === 0) throw new NotFoundException("No affirmations available");
    const hash = createHash("sha256").update(`${userId ?? "anon"}:${date}`).digest();
    return items[hash.readUInt32BE(0) % items.length];
  }
}

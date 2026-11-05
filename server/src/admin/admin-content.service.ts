import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { MOODS } from "../../prisma/content";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const IMAGE_URL_TTL = 60 * 60 * 24;

export type ImageContentType = keyof typeof IMAGE_TYPES;

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(contentType: ImageContentType) {
    const key = `content/${randomUUID()}.${IMAGE_TYPES[contentType]}`;
    return { key, uploadUrl: await this.storage.uploadUrl(key, contentType) };
  }

  async categories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { affirmations: true } } },
    });
    return Promise.all(
      categories.map(async ({ _count, ...category }) => ({
        ...category,
        count: _count.affirmations,
        imageUrl: await this.imageUrl(category.imageKey),
      })),
    );
  }

  async createCategory(input: CategoryInput) {
    await this.assertImage(input.imageKey);
    const existing = await this.prisma.category.findUnique({ where: { id: input.id }, select: { id: true } });
    if (existing) {
      throw new ConflictException({ code: "CATEGORY_EXISTS", message: "A category with that id already exists." });
    }
    const last = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    const category = await this.prisma.category.create({
      data: { ...input, sortOrder: (last._max.sortOrder ?? 0) + 1 },
    });
    return { ...category, count: 0, imageUrl: await this.imageUrl(category.imageKey) };
  }

  async updateCategory(id: string, input: Partial<CategoryInput>) {
    const current = await this.prisma.category.findUnique({ where: { id } });
    if (!current) throw new NotFoundException({ code: "CATEGORY_NOT_FOUND", message: "Category not found." });
    if (input.imageKey) await this.assertImage(input.imageKey);
    const category = await this.prisma.category.update({ where: { id }, data: input });
    if (input.imageKey && current.imageKey && input.imageKey !== current.imageKey) {
      await this.storage.remove(current.imageKey).catch(() => undefined);
    }
    const count = await this.prisma.affirmation.count({ where: { categoryId: id } });
    return { ...category, count, imageUrl: await this.imageUrl(category.imageKey) };
  }

  async deleteCategory(id: string) {
    const current = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { affirmations: true } } },
    });
    if (!current) throw new NotFoundException({ code: "CATEGORY_NOT_FOUND", message: "Category not found." });
    if (current._count.affirmations > 0) {
      throw new BadRequestException({
        code: "CATEGORY_NOT_EMPTY",
        message: "Move or delete this category's affirmations first.",
      });
    }
    await this.prisma.category.delete({ where: { id } });
    if (current.imageKey) await this.storage.remove(current.imageKey).catch(() => undefined);
  }

  async affirmations(categoryId?: string) {
    const items = await this.prisma.affirmation.findMany({
      where: categoryId ? { categoryId } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        text: true,
        categoryId: true,
        moods: true,
        isPremium: true,
        imageKey: true,
        createdAt: true,
      },
    });
    return Promise.all(items.map(async (item) => ({ ...item, imageUrl: await this.imageUrl(item.imageKey) })));
  }

  async createAffirmation(input: AffirmationInput) {
    await this.assertCategory(input.categoryId);
    await this.assertImage(input.imageKey);
    const affirmation = await this.prisma.affirmation.create({ data: input });
    return { ...affirmation, imageUrl: await this.imageUrl(affirmation.imageKey) };
  }

  async updateAffirmation(id: string, input: Partial<AffirmationInput>) {
    const current = await this.prisma.affirmation.findUnique({ where: { id } });
    if (!current) throw new NotFoundException({ code: "AFFIRMATION_NOT_FOUND", message: "Affirmation not found." });
    if (input.categoryId) await this.assertCategory(input.categoryId);
    if (input.imageKey) await this.assertImage(input.imageKey);
    const affirmation = await this.prisma.affirmation.update({ where: { id }, data: input });
    if (input.imageKey && current.imageKey && input.imageKey !== current.imageKey) {
      await this.storage.remove(current.imageKey).catch(() => undefined);
    }
    return { ...affirmation, imageUrl: await this.imageUrl(affirmation.imageKey) };
  }

  async deleteAffirmation(id: string) {
    const current = await this.prisma.affirmation.findUnique({ where: { id }, select: { imageKey: true } });
    if (!current) throw new NotFoundException({ code: "AFFIRMATION_NOT_FOUND", message: "Affirmation not found." });
    await this.prisma.affirmation.delete({ where: { id } });
    if (current.imageKey) await this.storage.remove(current.imageKey).catch(() => undefined);
  }

  private async assertCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!category) throw new NotFoundException({ code: "CATEGORY_NOT_FOUND", message: "Category not found." });
  }

  private async assertImage(key: string) {
    if (!key.startsWith("content/") || !(await this.storage.exists(key))) {
      throw new BadRequestException({ code: "INVALID_IMAGE", message: "Upload the image again." });
    }
  }

  private imageUrl(key: string | null) {
    return key ? this.storage.downloadUrl(key, IMAGE_URL_TTL) : Promise.resolve(null);
  }
}

export interface CategoryInput {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isPremium: boolean;
  imageKey: string;
}

export interface AffirmationInput {
  text: string;
  categoryId: string;
  moods: (typeof MOODS)[number][];
  isPremium: boolean;
  imageKey: string;
  lang?: string;
}

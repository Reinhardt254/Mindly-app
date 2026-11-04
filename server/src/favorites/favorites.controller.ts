import { Controller, Delete, Get, HttpCode, NotFoundException, Param, Put } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "../common/session";
import { PrismaService } from "../prisma/prisma.service";

@Controller("favorites")
export class FavoritesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Session() session: UserSession) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        affirmation: { select: { id: true, text: true, categoryId: true, moods: true, isPremium: true } },
      },
    });
    return favorites.map((f) => ({ ...f.affirmation, favoritedAt: f.createdAt }));
  }

  @Put(":affirmationId")
  @HttpCode(204)
  async add(@Session() session: UserSession, @Param("affirmationId") affirmationId: string) {
    const exists = await this.prisma.affirmation.count({ where: { id: affirmationId } });
    if (!exists) throw new NotFoundException("Affirmation not found");
    await this.prisma.favorite.upsert({
      where: { userId_affirmationId: { userId: session.user.id, affirmationId } },
      create: { userId: session.user.id, affirmationId },
      update: {},
    });
  }

  @Delete(":affirmationId")
  @HttpCode(204)
  async remove(@Session() session: UserSession, @Param("affirmationId") affirmationId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId: session.user.id, affirmationId } });
  }
}

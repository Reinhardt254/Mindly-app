import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { MOODS } from "../../prisma/content";
import { AdminContentService } from "./admin-content.service";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

const imageType = z.enum(["image/jpeg", "image/png", "image/webp"]);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes");
const color = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a color like #7C5CFC");
const imageKey = z.string().min(1).max(300);

const categorySchema = z.object({
  id: slug,
  name: z.string().trim().min(1).max(40),
  icon: z.string().trim().min(1).max(40),
  color,
  description: z.string().trim().min(1).max(160),
  isPremium: z.boolean(),
  imageKey,
});

const categoryPatchSchema = categorySchema.omit({ id: true }).partial();

const affirmationSchema = z.object({
  text: z.string().trim().min(1).max(500),
  categoryId: z.string().min(1).max(50),
  moods: z.array(z.enum(MOODS)).max(8).default([]),
  isPremium: z.boolean(),
  imageKey,
});

const affirmationPatchSchema = affirmationSchema.partial();

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly content: AdminContentService,
  ) {}

  @Get("overview")
  overview() {
    return this.admin.overview();
  }

  @Get("users")
  users(@Query("query") query?: string) {
    return this.admin.users(query);
  }

  @Post("admins")
  promote(@Body(new ZodPipe(z.object({ email: z.string().email() }))) body: { email: string }) {
    return this.admin.promote(body.email);
  }

  @Delete("admins/:userId")
  demote(@Param("userId") userId: string) {
    return this.admin.demote(userId);
  }

  @Post("users/:userId/suspend")
  suspend(@Session() session: UserSession, @Param("userId") userId: string) {
    return this.admin.setStatus(session.user.id, userId, "SUSPENDED");
  }

  @Post("users/:userId/activate")
  activate(@Session() session: UserSession, @Param("userId") userId: string) {
    return this.admin.setStatus(session.user.id, userId, "ACTIVE");
  }

  @Delete("users/:userId")
  @HttpCode(204)
  removeAccount(@Session() session: UserSession, @Param("userId") userId: string) {
    return this.admin.removeAccount(session.user.id, userId);
  }

  @Post("uploads")
  upload(@Body(new ZodPipe(z.object({ contentType: imageType }))) body: { contentType: z.infer<typeof imageType> }) {
    return this.content.upload(body.contentType);
  }

  @Get("categories")
  categories() {
    return this.content.categories();
  }

  @Post("categories")
  createCategory(@Body(new ZodPipe(categorySchema)) body: z.infer<typeof categorySchema>) {
    return this.content.createCategory(body);
  }

  @Patch("categories/:id")
  updateCategory(
    @Param("id") id: string,
    @Body(new ZodPipe(categoryPatchSchema)) body: z.infer<typeof categoryPatchSchema>,
  ) {
    return this.content.updateCategory(id, body);
  }

  @Delete("categories/:id")
  @HttpCode(204)
  deleteCategory(@Param("id") id: string) {
    return this.content.deleteCategory(id);
  }

  @Get("affirmations")
  affirmations(@Query("categoryId") categoryId?: string) {
    return this.content.affirmations(categoryId);
  }

  @Post("affirmations")
  createAffirmation(@Body(new ZodPipe(affirmationSchema)) body: z.infer<typeof affirmationSchema>) {
    return this.content.createAffirmation(body);
  }

  @Patch("affirmations/:id")
  updateAffirmation(
    @Param("id") id: string,
    @Body(new ZodPipe(affirmationPatchSchema)) body: z.infer<typeof affirmationPatchSchema>,
  ) {
    return this.content.updateAffirmation(id, body);
  }

  @Delete("affirmations/:id")
  @HttpCode(204)
  deleteAffirmation(@Param("id") id: string) {
    return this.content.deleteAffirmation(id);
  }
}

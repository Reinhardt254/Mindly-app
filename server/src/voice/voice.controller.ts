import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { UserSession } from "../common/session";
import { ZodPipe } from "../common/zod.pipe";
import { Premium } from "../premium/premium.guard";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

const MIME_EXT: Record<string, string> = {
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/aac": "aac",
  "audio/mpeg": "mp3",
  "audio/webm": "webm",
};

const uploadSchema = z.object({ mimeType: z.enum(Object.keys(MIME_EXT) as [string, ...string[]]) });

const createSchema = z.object({
  objectKey: z.string().max(300),
  mimeType: z.enum(Object.keys(MIME_EXT) as [string, ...string[]]),
  durationMs: z.number().int().min(0).max(10 * 60_000),
  affirmationId: z.string().max(100).optional(),
  affirmationText: z.string().max(1000).optional(),
});

@Controller("voice")
@Premium()
export class VoiceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Post("upload-url")
  async uploadUrl(@Session() session: UserSession, @Body(new ZodPipe(uploadSchema)) body: z.infer<typeof uploadSchema>) {
    const objectKey = `voice/${session.user.id}/${randomUUID()}.${MIME_EXT[body.mimeType]}`;
    return { objectKey, uploadUrl: await this.storage.uploadUrl(objectKey, body.mimeType) };
  }

  @Post()
  async create(@Session() session: UserSession, @Body(new ZodPipe(createSchema)) body: z.infer<typeof createSchema>) {
    if (!body.objectKey.startsWith(`voice/${session.user.id}/`)) throw new BadRequestException("Invalid object key");
    if (!(await this.storage.exists(body.objectKey))) throw new BadRequestException("Upload not found");
    const recording = await this.prisma.voiceRecording.create({ data: { userId: session.user.id, ...body } });
    return { ...recording, url: await this.storage.downloadUrl(recording.objectKey) };
  }

  @Get()
  async list(@Session() session: UserSession) {
    const recordings = await this.prisma.voiceRecording.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(recordings.map(async (r) => ({ ...r, url: await this.storage.downloadUrl(r.objectKey) })));
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Session() session: UserSession, @Param("id") id: string) {
    const recording = await this.prisma.voiceRecording.findFirst({ where: { id, userId: session.user.id } });
    if (!recording) throw new NotFoundException();
    await this.storage.remove(recording.objectKey);
    await this.prisma.voiceRecording.delete({ where: { id } });
  }
}

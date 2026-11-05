import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userId: string | undefined = context.switchToHttp().getRequest().session?.user?.id;
    if (!userId) throw new ForbiddenException({ code: "ADMIN_REQUIRED", message: "Admin access required" });
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== "ADMIN") {
      throw new ForbiddenException({ code: "ADMIN_REQUIRED", message: "Admin access required" });
    }
    return true;
  }
}

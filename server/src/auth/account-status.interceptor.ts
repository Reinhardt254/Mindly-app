import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** Rejects API calls from an account that an admin has suspended. */
@Injectable()
export class AccountStatusInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const userId: string | undefined = context.switchToHttp().getRequest().session?.user?.id;
    if (!userId) return next.handle();
    const account = await this.prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
    if (account?.status === "SUSPENDED") {
      throw new ForbiddenException({ code: "ACCOUNT_SUSPENDED", message: "This account is suspended." });
    }
    return next.handle();
  }
}

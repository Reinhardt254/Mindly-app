import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from "@nestjs/common";
import { PremiumService } from "./premium.service";

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly premium: PremiumService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.session?.user?.id;
    if (!userId || !(await this.premium.isPremium(userId))) {
      throw new ForbiddenException({ code: "PREMIUM_REQUIRED", message: "Premium subscription required" });
    }
    return true;
  }
}

export const Premium = () => applyDecorators(UseGuards(PremiumGuard));

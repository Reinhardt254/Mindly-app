import type { UserSession } from "@thallesp/nestjs-better-auth";

export type { UserSession };

export function userIdOf(session: UserSession): string {
  return session.user.id;
}

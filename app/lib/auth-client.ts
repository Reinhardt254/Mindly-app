import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_URL, APP_SCHEME } from "./config";

export const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: "/api/auth",
  plugins: [
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: APP_SCHEME,
      storage: SecureStore,
    }),
  ],
});

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  isPremium?: boolean;
};

export type AuthSession = {
  user: AuthUser;
  session: { id: string; userId: string; expiresAt: string | Date };
};

type SessionState = {
  data: AuthSession | null;
  isPending: boolean;
  error: unknown;
  refetch: () => Promise<void>;
};

// better-auth's inferred client types collapse to `never` without a shared server type.
export const useSession = () => authClient.useSession() as unknown as SessionState;

export const signOut = () => (authClient.signOut as unknown as () => Promise<unknown>)();

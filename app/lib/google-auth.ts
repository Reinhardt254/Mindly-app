import Constants from "expo-constants";
import { NativeModules, Platform, TurboModuleRegistry } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined;

let configured = false;

const STEP_TIMEOUT_MS = 20_000;

function runtimeContext(): string {
  const ownership = Constants.appOwnership ?? "unknown";
  const execution = Constants.executionEnvironment ?? "unknown";
  const appId = Constants.expoConfig?.android?.package ?? Constants.expoConfig?.ios?.bundleIdentifier ?? "unknown";
  return `runtime=${ownership}/${execution}; platform=${Platform.OS}; appId=${appId}`;
}

function isExpoGo(): boolean {
  return (
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient"
  );
}

function getNativeGoogleModule(): unknown {
  try {
    const turbo = TurboModuleRegistry.get("RNGoogleSignin");
    if (turbo != null) return turbo;
  } catch {
    // Some runtimes throw when the module is absent.
  }
  return NativeModules.RNGoogleSignin ?? null;
}

function assertNativeModulePresent() {
  if (getNativeGoogleModule() != null) return;

  if (isExpoGo()) {
    throw new Error(
      `Google Sign-In is not available in Expo Go (${runtimeContext()}). Build and open the Moodly app with \`npx expo run:android\`.`,
    );
  }

  throw new Error(
    `RNGoogleSignin native module is missing from this build (${runtimeContext()}). Rebuild with \`npx expo run:android\` so the native Google Sign-In module is linked.`,
  );
}

type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

async function loadGoogleSignIn(): Promise<GoogleSignInModule> {
  // Synchronous require: Metro lazy `import()` chunks go stale across reloads ("Requiring unknown module").
  try {
    return require("@react-native-google-signin/google-signin") as GoogleSignInModule;
  } catch (error) {
    throw new Error(
      `Failed to load @react-native-google-signin/google-signin (${runtimeContext()}): ${formatUnknownError(error)}`,
    );
  }
}

function withStepTimeout<T>(promise: Promise<T>, step: string, ms = STEP_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(
          new Error(
            `Timed out during "${step}" after ${Math.round(ms / 1000)}s (${runtimeContext()}; nativeModule=${getNativeGoogleModule() != null ? "present" : "missing"}; webClientId=${webClientId ? "set" : "missing"}).${
              step.includes("account picker")
                ? " If a dim overlay is still visible, press Back to close Google Sign-In, then try again."
                : ""
            }`,
          ),
        );
      }, ms);
    }),
  ]);
}

async function ensureConfigured() {
  assertNativeModulePresent();
  if (configured) return;
  if (!webClientId) {
    throw new Error(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add your Google Web OAuth client ID to app/.env and restart Metro.",
    );
  }
  const { GoogleSignin } = await withStepTimeout(loadGoogleSignIn(), "import google-signin module");
  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
  });
  configured = true;
}

export type GoogleSignInResult =
  | { cancelled: true }
  | { cancelled: false; idToken: string; accessToken?: string };

let signInLock: Promise<GoogleSignInResult> | null = null;

/**
 * Opens the native Google account picker (not a browser) and returns an ID token
 * for Better Auth `signIn.social({ idToken })`.
 */
export async function signInWithGoogleNative(): Promise<GoogleSignInResult> {
  // Overlapping native calls leave Android stuck on a blank dim overlay.
  if (signInLock) {
    throw new Error("Google sign-in is already in progress. Press Back to dismiss the Google overlay, then try again.");
  }

  signInLock = (async () => {
    await ensureConfigured();
    const { GoogleSignin, isSuccessResponse } = await withStepTimeout(
      loadGoogleSignIn(),
      "import google-signin module",
    );

    if (Platform.OS === "android") {
      await withStepTimeout(
        GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }),
        "Google Play Services check",
      );
    }

    // Do not call signOut() here — it hangs on some Android builds and, if still
    // running, makes signIn() show only a blank translucent overlay.

    const response = await withStepTimeout(
      GoogleSignin.signIn(),
      "native Google account picker",
      45_000,
    );

    if (!isSuccessResponse(response)) {
      return { cancelled: true };
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new Error(
        "Google account picker succeeded but returned no ID token. Check that EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is the Web client ID (not Android/iOS) and matches your Google Cloud OAuth credentials.",
      );
    }

    const tokens = await withStepTimeout(
      GoogleSignin.getTokens().catch(() => null),
      "fetch Google access token",
      8_000,
    );

    return {
      cancelled: false,
      idToken,
      accessToken: tokens?.accessToken,
    };
  })();

  try {
    return await signInLock;
  } finally {
    signInLock = null;
  }
}

export function formatUnknownError(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const value = error as Record<string, unknown>;
    const parts: string[] = [];

    if (typeof value.message === "string" && value.message.trim()) {
      parts.push(value.message.trim());
    }
    if (value.code != null) parts.push(`code=${String(value.code)}`);
    if (typeof value.name === "string" && value.name && value.name !== "Error") {
      parts.push(`name=${value.name}`);
    }
    if (value.userInfo != null) {
      try {
        parts.push(`userInfo=${JSON.stringify(value.userInfo)}`);
      } catch {
        parts.push(`userInfo=${String(value.userInfo)}`);
      }
    }
    if (parts.length > 0) return parts.join(" · ");
  }

  if (error instanceof Error && error.message) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function googleSignInErrorMessage(error: unknown): Promise<string> {
  const raw = formatUnknownError(error);

  try {
    const { isErrorWithCode, statusCodes } = await loadGoogleSignIn();
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return "";
        case statusCodes.IN_PROGRESS:
          return "Google sign-in is already in progress.";
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return `Google Play Services is not available on this device. (${raw})`;
        default:
          break;
      }
    }
  } catch {
    // Native module may be missing — fall through with the raw error.
  }

  const lowered = raw.toLowerCase();
  if (lowered.includes("developer_error") || lowered.includes("code=10")) {
    return `Google Sign-In developer error (usually wrong Android OAuth client / SHA-1). Package must be com.kirix.moodly with your debug/release SHA-1 in Google Cloud. Details: ${raw}`;
  }

  if (raw) return raw;
  return `Google sign-in failed (${runtimeContext()}).`;
}

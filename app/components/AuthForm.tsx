import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { authClient } from "@/lib/auth-client";
import { APP_NAME } from "@/lib/config";
import { googleSignInErrorMessage, signInWithGoogleNative } from "@/lib/google-auth";
import { consumeSuspendedNotice, subscribeSuspended } from "@/lib/suspension";

type Mode = "sign-in" | "sign-up";

const SOCIAL_SIGN_IN_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function AuthForm({ mode }: { mode: Mode }) {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useLocalStorage();
  const [name, setName] = useState(userProfile?.name ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = consumeSuspendedNotice();
    if (existing) setError(existing);
    return subscribeSuspended(setError);
  }, []);

  const showError = (message: string) => {
    setError(message);
    // Android Google Sign-In can leave Activity null briefly; Alert would be a no-op.
    const present = () => Alert.alert("Sign-in failed", message);
    if (Platform.OS === "android") {
      setTimeout(present, 450);
    } else {
      present();
    }
  };

  const isSignUp = mode === "sign-up";
  const canSubmit =
    /\S+@\S+\.\S+/.test(email) && password.length >= 8 && (!isSignUp || name.trim().length > 0);

  const handleEmail = async () => {
    setError(null);
    setLoading("email");
    try {
      const { error } = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (error) showError(error.message ?? "Something went wrong");
    } catch {
      showError("Can't reach the server. Check your connection.");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading("google");
    try {
      const google = await signInWithGoogleNative();
      if (google.cancelled) return;

      const { error } = await withTimeout(
        authClient.signIn.social({
          provider: "google",
          idToken: {
            token: google.idToken,
            accessToken: google.accessToken,
          },
        }),
        SOCIAL_SIGN_IN_TIMEOUT_MS,
        "Better Auth Google sign-in timed out while exchanging the ID token with the API.",
      );
      if (error) {
        showError(
          error.message
            ? `Auth API: ${error.message}${error.code ? ` (code=${error.code})` : ""}`
            : "Auth API rejected Google sign-in.",
        );
        return;
      }
      router.replace(userProfile ? "/(tabs)" : "/welcome/quote");
    } catch (error) {
      const message = await googleSignInErrorMessage(error);
      if (message) showError(message);
    } finally {
      setLoading(null);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      style={[styles.flex, { backgroundColor: palette.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 24) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces
      >
        <Image
          source={require("../assets/images/moodly-icon.png")}
          style={styles.logo}
          accessibilityLabel={`${APP_NAME} logo`}
        />
        <Text style={[styles.title, { color: palette.text }]}>
          {isSignUp ? "Create your account" : `Welcome back to ${APP_NAME}`}
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          {isSignUp
            ? "Save your favorites, streak and affirmations across devices."
            : "Sign in to keep your streak and favorites in sync."}
        </Text>

        <TouchableOpacity
          onPress={handleGoogle}
          disabled={!!loading}
          activeOpacity={0.85}
          style={[styles.google, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Ionicons name="logo-google" size={18} color={palette.text} />
          <Text style={[styles.googleText, { color: palette.text }]}>
            {loading === "google" ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <Text style={[styles.dividerText, { color: palette.textMuted }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
        </View>

        {isSignUp && (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={palette.textMuted}
            autoComplete="name"
            style={inputStyle}
          />
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={palette.textMuted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={inputStyle}
        />
        <View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (8+ characters)"
            placeholderTextColor={palette.textMuted}
            secureTextEntry={!showPassword}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            style={[inputStyle, { paddingRight: 48 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eye}
            hitSlop={10}
          >
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}

        <PrimaryButton
          title={isSignUp ? "Create account" : "Sign in"}
          onPress={handleEmail}
          loading={loading === "email"}
          disabled={!canSubmit || !!loading}
          style={styles.submit}
        />

        <TouchableOpacity
          onPress={() => router.replace(isSignUp ? "/auth/sign-in" : "/auth/sign-up")}
          style={styles.switch}
        >
          <Text style={[styles.switchText, { color: palette.textMuted }]}>
            {isSignUp ? "Already have an account? " : "New here? "}
            <Text style={{ color: palette.accent, fontFamily: Fonts.semibold }}>
              {isSignUp ? "Sign in" : "Create an account"}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: 16,
  },
  google: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  googleText: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 6,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  eye: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  error: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: "center",
  },
  submit: {
    marginTop: 8,
  },
  switch: {
    alignItems: "center",
    paddingVertical: 10,
  },
  switchText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
});

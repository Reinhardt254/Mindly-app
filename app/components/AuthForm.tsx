import React, { useEffect, useState } from "react";
import {
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
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { authClient } from "@/lib/auth-client";
import { APP_NAME } from "@/lib/config";
import { consumeSuspendedNotice, subscribeSuspended } from "@/lib/suspension";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: Mode }) {
  const palette = usePalette();
  const router = useRouter();
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
      if (error) setError(error.message ?? "Something went wrong");
    } catch {
      setError("Can't reach the server. Check your connection.");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading("google");
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      if (error) setError(error.message ?? "Google sign-in failed");
    } catch {
      setError("Google sign-in failed. Please try again.");
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: palette.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.logo, { backgroundColor: palette.accentSoft }]}>
          <Ionicons name="sparkles" size={30} color={palette.accent} />
        </View>
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
            {loading === "google" ? "Opening Google..." : "Continue with Google"}
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
    padding: 24,
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
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

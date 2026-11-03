import React, { useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "@/components/GradientBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function QuotePage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get("window").width;

  //   useEffect(() => {
  //     // Auto-navigate to welcome page after 3 seconds
  //     const timer = setTimeout(() => {
  //       router.replace("/welcome");
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }, [router]);

  const handleContinue = () => {
    router.replace("/welcome");
  };

  return (
    <>
      <GradientBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Quote Text */}
            <Text
              style={[
                styles.quoteText,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              &ldquo;Your mind is a powerful thing. When you fill it with
              positive thoughts, your life will start to change.&rdquo;
            </Text>

            {/* Attribution */}
            <Text
              style={[
                styles.attribution,
                {
                  color: Colors[colorScheme ?? "light"].tabIconSelected,
                },
              ]}
            >
              - MINDFUL MOMENTS
            </Text>

            {/* Loading indicator */}
            {/* <View style={{ marginTop: 64 }}>
            <Text
              style={{
                color: Colors[colorScheme ?? "light"].text,
                opacity: 0.7,
                fontSize: 14,
              }}
            >
              Preparing your journey...
            </Text>
          </View> */}

            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.continueButton,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].text,
                  borderColor: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              <Text
                style={[
                  styles.continueText,
                  {
                    color: Colors[colorScheme ?? "light"].background,
                  },
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    gap: 24,
  },
  quoteText: {
    fontStyle: "italic",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 1,
  },
  attribution: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 30,
  },
  continueButton: {
    padding: 8,
    height: 55,
    width: 300,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
  },
  continueText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

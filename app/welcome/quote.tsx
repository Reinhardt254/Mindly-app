import React, { useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors[colorScheme ?? "light"].tabbarBackground}
        translucent={true}
        animated={true}
      />
      <GradientBackground>
        <View className="flex-1 justify-center items-center px-8 w-full h-full">
          <View className="items-center space-y-6">
            {/* Quote Text */}
            <Text
              className="text-center"
              style={{
                fontStyle: "italic",
                fontFamily: "serif",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 36,
                lineHeight: 44,
                letterSpacing: 1,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              &ldquo;Your mind is a powerful thing. When you fill it with
              positive thoughts, your life will start to change.&rdquo;
            </Text>

            {/* Attribution */}
            <Text
              className="text-xl font-bold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].tabIconSelected,
                fontSize: 18,
                marginTop: 30,
                marginBottom: 30,
              }}
            >
              - MINDFUL MOMENTS
            </Text>

            {/* Loading indicator */}
            {/* <View className="mt-16">
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
              className="p-2 mt-10 w-full rounded-md"
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].text,
                height: 55,
                width: 300,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? "light"].text,
                marginTop: 20,
              }}
            >
              <Text
                className="text-center"
                style={{
                  color: Colors[colorScheme ?? "light"].background,
                  fontSize: 20,
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
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

import { AFFIRMATIONS } from "@/constants/Affirmations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { timeUtils } from "@/utils/timeUtils";
import React, { useState } from "react";
import {
  Alert,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { GradientBackground } from "@/components/GradientBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AffirmationScreen() {
  const { userProfile, saveAppState } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const colorScheme = useColorScheme();

  const screenWidth = Dimensions.get("window").width;

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Alert.alert(
      isLiked ? "Unliked" : "Liked!",
      isLiked ? "Removed from favorites" : "Added to favorites"
    );
  };


  // Handle carousel index change
  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    setDailyShown((prev) => prev + 1);
    setIsLiked(false);

    // Save progress
    saveAppState({
      userProfile: userProfile!,
      currentAffirmationIndex: index,
      dailyAffirmationsShown: dailyShown + 1,
      lastAffirmationDate: timeUtils.getCurrentDateString(),
    });
  };

  // Render carousel item
  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <View className="flex-col flex-1 justify-end items-end px-8 w-full h-full" style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <View className="items-center space-y-6">
        {/* Quote Text */}
        <Text
          className="text-6xl text-center text-yellow-400"
          style={{
            fontStyle: "italic",
            fontFamily: "serif",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 40,
            lineHeight: 50,
            letterSpacing: 1,
            color: Colors[colorScheme ?? "light"].text,
          }}
        >
          &ldquo;{item.text}&rdquo;
        </Text>

        {/* Attribution */}
        <Text
          className="pt-10 text-xl font-bold text-center"
          style={{
            color: "#279089",
          }}
        >
          - {item.category.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  // const handleReset = () => {
  //   Alert.alert(
  //     "Reset App",
  //     "This will clear all your data and take you back to the welcome screen. Are you sure?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Reset",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             await storage.clearAllData();
  //             // Force reload by updating the app state
  //             window.location.reload();
  //           } catch (error) {
  //             console.error("Error resetting app:", error);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-900">
        <Text className="text-lg text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors[colorScheme ?? "light"].tabbarBackground}
        translucent={true}
        animated={true}
      />
      <GradientBackground>
        <View className="flex flex-1 justify-center items-center h-full">
          {/* Header */}
          <View
            className="flex-0.1 h-10"
            style={{
              height: 100,
              width: "90%",
            }}
          ></View>
{/* 
          <View className="flex justify-center items-center w-full h-full" style={{
            height: 100,
          }}>
            <Text className="text-2xl text-center text-black">
              Welcome Back! {userProfile.name}
            </Text>
          </View> */}

          {/* Main Content - Centered Quote */}
          <View
            className="flex-1 justify-center items-center w-full h-full"
            style={{
              flex: 1,
              height: 100,
            }}
          >
            <Carousel
              loop
              width={screenWidth}
              height={screenWidth * 1.2}
              data={AFFIRMATIONS}
              scrollAnimationDuration={1000}
              onSnapToItem={handleIndexChange}
              renderItem={renderCarouselItem}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
            />
          </View>

          {/* Bottom Interactive Elements */}
          <View
            className="flex gap-y-6 justify-center items-center space-y-6 items-enter"
            style={{
              borderRadius: 20,
              height: 180,
              width: "100%",
            }}
          >
            {/* Like Button */}
            <TouchableOpacity
              onPress={handleLikePress}
              className="flex justify-center items-center p-3"
              style={{
                marginBottom: 10,
                height: 60,
                width: 60,
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={45}
                color={isLiked ? "#EF4444" : "#F87171"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </GradientBackground>
    </>
  );
}

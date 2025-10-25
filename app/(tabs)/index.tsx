import { AFFIRMATIONS } from "@/constants/Affirmations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { timeUtils } from "@/utils/timeUtils";
import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { Sidebar } from "@/components/Sidebar";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useBackground } from "@/contexts/BackgroundContext";

export default function AffirmationScreen() {
  const { userProfile, saveAppState } = useLocalStorage();
  const [, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { customBackground } = useBackground();
  const colorScheme = useColorScheme();

  const screenWidth = Dimensions.get("window").width;

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Alert.alert(
      isLiked ? "Unliked" : "Liked!",
      isLiked ? "Removed from favorites" : "Added to favorites"
    );
  };

  const handleRefreshPress = () => {
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    setCurrentIndex(randomIndex);
    setDailyShown((prev) => prev + 1);
    setIsLiked(false);

    // Save progress
    saveAppState({
      userProfile: userProfile!,
      currentAffirmationIndex: randomIndex,
      dailyAffirmationsShown: dailyShown + 1,
      lastAffirmationDate: timeUtils.getCurrentDateString(),
    });
  };

  const handleSharePress = () => {
    Alert.alert("Share", "Share this affirmation with others!");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <View
      className="flex-col items-end justify-end flex-1 w-full h-full px-8"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
            color: Colors[colorScheme ?? "light"].quoteText,
          }}
        >
          &ldquo;{item.text}&rdquo;
        </Text>

        {/* Attribution */}
        <Text
          className="pt-10 text-xl font-bold text-center"
          style={{
            color: Colors[colorScheme ?? "light"].tint,
          }}
        >
          - {item.category.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (!userProfile) {
    return (
      <View className="items-center justify-center flex-1 bg-purple-900">
        <Text className="text-lg text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ImageBackground
        source={
          customBackground
            ? { uri: customBackground }
            : require("@/assets/images/home.jpg")
        }
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)", // 50% dark overlay
            zIndex: 1,
          }}
        />
        <View
          className="relative flex items-center justify-center flex-1 h-full"
          style={{ zIndex: 2 }}
        >
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Hamburger Menu */}
          <TouchableOpacity
            onPress={toggleSidebar}
            className="absolute z-30 p-2 top-12 left-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderRadius: 8,
              position: "absolute",
              top: 12,
              left: 4,
            }}
          >
            <Ionicons
              name="menu"
              size={30}
              color={Colors[colorScheme ?? "light"].quoteText}
            />
          </TouchableOpacity>

          {/* Main Content - Centered Quote */}
          <View
            className="items-center justify-center flex-1 w-full h-full"
            style={{
              flex: 1,
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
            className="flex flex-row justify-center space-y-6 items-enter gap-y-6"
            style={{
              borderRadius: 20,
              height: 100,
              width: "100%",
              gap: 10,
            }}
          >
            {/* Like Button */}
            <TouchableOpacity
              onPress={handleLikePress}
              className="flex items-center justify-center w-full h-full p-0"
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

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={handleRefreshPress}
              className="flex items-center justify-center p-0"
              style={{
                marginBottom: 10,
                height: 60,
                width: 60,
                backgroundColor: "#279089",
                borderRadius: 30,
              }}
            >
              <Ionicons name="refresh" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleSharePress}
              className="flex items-center justify-center p-0"
              style={{
                marginBottom: 10,
                height: 60,
                width: 60,
              }}
            >
              <Ionicons name="share-outline" size={45} color="#F87171" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 60,
            }}
          />
        </View>
      </ImageBackground>
    </>
  );
}

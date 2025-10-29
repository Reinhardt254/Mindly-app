import { AFFIRMATIONS } from "@/constants/Affirmations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { timeUtils } from "@/utils/timeUtils";
import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { Sidebar } from "@/components/Sidebar";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useBackground } from "@/contexts/BackgroundContext";
import { useStatsStore } from "@/stores/statsStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Popup } from "@/components/Popup";
import { AffirmationsPracticePopup } from "@/components/AffirmationsPracticePopup";
import { AffirmationsPracticeSession } from "@/components/AffirmationsPracticeSession";
import ViewShot from "react-native-view-shot";

export default function AffirmationScreen() {
  const { userProfile, saveAppState } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPracticePopupVisible, setIsPracticePopupVisible] = useState(false);
  const [isPracticeSessionVisible, setIsPracticeSessionVisible] =
    useState(false);
  const [practiceDuration, setPracticeDuration] = useState(5);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });
  const { customBackground } = useBackground();
  const colorScheme = useColorScheme();
  const { logActivity } = useStatsStore();
  const { selectedCategory } = useCategoryStore();
  const viewShotRef = useRef<ViewShot>(null);

  // Filter affirmations based on selected category
  const filteredAffirmations = useMemo(() => {
    if (selectedCategory === "all") {
      return AFFIRMATIONS;
    }
    return AFFIRMATIONS.filter(
      (affirmation) => affirmation.category === selectedCategory
    );
  }, [selectedCategory]);

  const screenWidth = Dimensions.get("window").width;

  const showPopup = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[]
  ) => {
    setPopupConfig({ title, message, buttons });
    setIsPopupVisible(true);
  };

  const handleLikePress = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Log activity
    logActivity({
      type: "affirmation_liked",
      affirmationId: filteredAffirmations[currentIndex]?.id?.toString(),
      affirmationText: filteredAffirmations[currentIndex]?.text,
      affirmationCategory: filteredAffirmations[currentIndex]?.category,
    });

    showPopup(
      newLikedState ? "Liked!" : "Unliked",
      newLikedState ? "Added to favorites" : "Removed from favorites",
      [{ text: "OK", onPress: () => {} }]
    );
  };

  const handleRefreshPress = () => {
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    setCurrentIndex(randomIndex);
    setDailyShown((prev) => prev + 1);
    setIsLiked(false);

    // Log activity
    logActivity({
      type: "affirmation_refreshed",
      affirmationId: AFFIRMATIONS[randomIndex]?.id?.toString(),
      affirmationText: AFFIRMATIONS[randomIndex]?.text,
      affirmationCategory: AFFIRMATIONS[randomIndex]?.category,
    });

    // Save progress
    saveAppState({
      userProfile: userProfile!,
      currentAffirmationIndex: randomIndex,
      dailyAffirmationsShown: dailyShown + 1,
      lastAffirmationDate: timeUtils.getCurrentDateString(),
    });
  };

  const handleSharePress = async () => {
    if (isSharing) {
      console.log("Already sharing, ignoring duplicate tap");
      return;
    }

    setIsSharing(true);

    try {
      console.log("=== Starting share process ===");

      const currentAffirmation = filteredAffirmations[currentIndex];
      const appName = "Mindly";
      const playStoreUrl =
        "https://play.google.com/store/apps/details?id=com.mindly.app"; // Replace with actual URL when available

      // Create share message
      const shareMessage = `💭 "${currentAffirmation?.text}"\n\n✨ Daily affirmations to transform your mindset!\n\n📱 Get ${appName} app:\n${playStoreUrl}`;

      // Log activity
      logActivity({
        type: "affirmation_shared",
        affirmationId: currentAffirmation?.id?.toString(),
        affirmationText: currentAffirmation?.text,
        affirmationCategory: currentAffirmation?.category,
      });

      console.log("Opening share dialog...");

      // Share using native Share API
      const result = await Share.share({
        message: shareMessage,
        title: `${appName} - Daily Affirmation`,
      });

      if (result.action === Share.sharedAction) {
        console.log("✅ Share completed successfully");
        if (result.activityType) {
          console.log("Shared via:", result.activityType);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed by user");
      }

      setIsSharing(false);
    } catch (error: any) {
      console.error("❌ Share error:", error);
      showPopup(
        "Error",
        `Failed to share: ${error?.message || "Unknown error"}`,
        [{ text: "OK", onPress: () => {} }]
      );
      setIsSharing(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePracticePress = () => {
    setIsPracticePopupVisible(true);
  };

  const handleStartPractice = (duration: number) => {
    setPracticeDuration(duration);
    setIsPracticeSessionVisible(true);
  };

  // Handle carousel index change
  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    setDailyShown((prev) => prev + 1);
    setIsLiked(false);

    // Log activity for viewing affirmation
    logActivity({
      type: "affirmation_viewed",
      affirmationId: AFFIRMATIONS[index]?.id?.toString(),
      affirmationText: AFFIRMATIONS[index]?.text,
      affirmationCategory: AFFIRMATIONS[index]?.category,
    });

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
    <ViewShot
      ref={index === currentIndex ? viewShotRef : null}
      options={{ format: "jpg", quality: 0.9 }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <View
        className="flex-col items-end justify-end flex-1 w-full h-full px-8"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: 20,
          padding: 20,
        }}
      >
        <View className="items-center space-y-6">
          {/* Quote Text */}
          <Text
            className="text-6xl text-center"
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
    </ViewShot>
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
              zIndex: 30,
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
              flex: 0.9,
              height: "100%",
            }}
          >
            <Carousel
              loop
              vertical={true}
              width={screenWidth}
              height={screenWidth * 1.65}
              data={filteredAffirmations}
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
              flex: 0.015,
              minHeight: 100,
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

            {/* Practice Button */}
            <TouchableOpacity
              onPress={handlePracticePress}
              className="flex items-center justify-center p-0"
              style={{
                marginBottom: 10,
                height: 60,
                width: 60,
                backgroundColor: "#20B2AA",
                borderRadius: 30,
              }}
            >
              <Ionicons name="play" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Refresh Button */}
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleSharePress}
              disabled={isSharing}
              className="flex items-center justify-center p-0"
              style={{
                marginBottom: 10,
                height: 60,
                width: 60,
                opacity: isSharing ? 0.5 : 1,
              }}
            >
              <Ionicons
                name={isSharing ? "hourglass" : "share-social"}
                size={45}
                color="#F87171"
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 10,
            }}
          />
        </View>
      </ImageBackground>

      {/* Popup */}
      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />

      {/* Practice Popup */}
      <AffirmationsPracticePopup
        visible={isPracticePopupVisible}
        onClose={() => setIsPracticePopupVisible(false)}
        onStartPractice={handleStartPractice}
      />

      {/* Practice Session */}
      <AffirmationsPracticeSession
        visible={isPracticeSessionVisible}
        duration={practiceDuration}
        onClose={() => setIsPracticeSessionVisible(false)}
        onRestart={() => {
          setIsPracticeSessionVisible(false);
          setIsPracticePopupVisible(true);
        }}
      />
    </>
  );
}

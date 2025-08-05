
import { AFFIRMATIONS } from "@/constants/Affirmations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { storage } from "@/utils/storage";
import { timeUtils } from "@/utils/timeUtils";
import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View, Text, Dimensions } from "react-native";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

export default function AffirmationScreen() {
  const { userProfile, saveAppState } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Swipe animation values
  const screenWidth = Dimensions.get("window").width;
  const translateX = useSharedValue(0);
  const nextTranslateX = useSharedValue(screenWidth);
  const prevTranslateX = useSharedValue(-screenWidth);
  const SWIPE_THRESHOLD = screenWidth * 0.3;

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const lastDate = await storage.getLastAffirmationDate();
      const shown = await storage.getDailyAffirmationsShown();

      if (lastDate && timeUtils.isToday(lastDate)) {
        setDailyShown(shown);
      } else {
        // New day, reset counter
        setDailyShown(0);
        await storage.setDailyAffirmationsShown(0);
        await storage.setLastAffirmationDate(timeUtils.getCurrentDateString());
      }
    } catch (error) {
      console.error("Error loading daily progress:", error);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    try {
      const newShown = dailyShown + 1;
      setDailyShown(newShown);
      await storage.setDailyAffirmationsShown(newShown);

      // Move to next affirmation
      const nextIndex = (currentIndex + 1) % AFFIRMATIONS.length;
      setCurrentIndex(nextIndex);

      // Save app state
      await saveAppState({
        userProfile: userProfile!,
        currentAffirmationIndex: nextIndex,
        dailyAffirmationsShown: newShown,
        lastAffirmationDate: timeUtils.getCurrentDateString(),
      });

      // Show feedback
      if (direction === "right") {
        Alert.alert(
          "Saved!",
          "This affirmation has been saved to your favorites."
        );
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };

  const handleProfilePress = () => {
    Alert.alert("Profile", "Profile settings coming soon!");
  };

  const handleMenuPress = () => {
    Alert.alert("Menu", "Menu options coming soon!");
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Alert.alert(
      isLiked ? "Unliked" : "Liked!",
      isLiked ? "Removed from favorites" : "Added to favorites"
    );
  };

  const handleMorePress = () => {
    Alert.alert("More Options", "Share, save, or report options coming soon!");
  };

  // Swipe to next affirmation
  const goToNextAffirmation = () => {
    const nextIndex = (currentIndex + 1) % AFFIRMATIONS.length;

    // Animate current card out to the left
    translateX.value = withSpring(-screenWidth, {
      damping: 20,
      stiffness: 50,
    });

    // Animate next card in from the right
    nextTranslateX.value = withSpring(0, {
      damping: 20,
      stiffness: 50,
    });

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setDailyShown((prev) => prev + 1);
      setIsLiked(false);

      // Reset positions
      translateX.value = 0;
      nextTranslateX.value = screenWidth;

      // Save progress
      saveAppState({
        userProfile: userProfile!,
        currentAffirmationIndex: nextIndex,
        dailyAffirmationsShown: (dailyShown as number) + 1,
        lastAffirmationDate: timeUtils.getCurrentDateString(),
      });
    }, 300);
  };

  // Swipe to previous affirmation
  const goToPreviousAffirmation = () => {
    const prevIndex =
      currentIndex === 0 ? AFFIRMATIONS.length - 1 : currentIndex - 1;

    // Animate current card out to the right
    translateX.value = withSpring(screenWidth, {
      damping: 20,
      stiffness: 90,
    });

    // Animate previous card in from the left
    prevTranslateX.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });

    setTimeout(() => {
      setCurrentIndex(prevIndex);
      setIsLiked(false);

      // Reset positions
      translateX.value = 0;
      prevTranslateX.value = -screenWidth;

      // Save progress
      saveAppState({
        userProfile: userProfile!,
        currentAffirmationIndex: prevIndex,
        dailyAffirmationsShown: dailyShown,
        lastAffirmationDate: timeUtils.getCurrentDateString(),
      });
    }, 300);
  };

  // Gesture handler for swipe
  const gesture = Gesture.Pan()
    .onStart((event) => {
      // Store initial position
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        if (event.translationX > 0) {
          // Swipe right - go to previous
          runOnJS(goToPreviousAffirmation)();
        } else {
          // Swipe left - go to next
          runOnJS(goToNextAffirmation)();
        }
      } else {
        // Reset position with spring animation if swipe wasn't strong enough
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    });

  // Animated style for the card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleReset = () => {
    Alert.alert(
      "Reset App",
      "This will clear all your data and take you back to the welcome screen. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.clearAllData();
              // Force reload by updating the app state
              window.location.reload();
            } catch (error) {
              console.error("Error resetting app:", error);
            }
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-900">
        <Text className="text-lg text-white">Loading...</Text>
      </View>
    );
  }

  const currentAffirmation = AFFIRMATIONS[currentIndex];

  return (
    <View
      className="flex flex-1 justify-center items-center h-full"
      style={{
        backgroundColor: "#F2F3D9",
      }}
    >
      {/* Header */}
      <View
        className="flex-0.1 h-10"
        style={{
          height: 20,
          width: "90%",
        }}
      ></View>
      <View
        className="flex-row justify-between items-center w-full px-6 py-4 flex-0.2 rounded-full"
        style={{
          height: 60,
          width: "90%",
          backgroundColor: "#1F7A8C",
        }}
      >
        <TouchableOpacity onPress={handleMenuPress} className="p-2">
          <View className="w-6 h-6">
            <View className="flex-col flex-wrap">
              <EvilIcons name="navicon" size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <Text
          className="text-lg font-semibold text-white"
          style={{
            fontFamily: "serif",
          }}
        >
          My Affirmations
        </Text>

        <TouchableOpacity onPress={handleProfilePress} className="p-2">
          <View className="w-8 h-8 bg-gray-300 rounded-full">
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content - Centered Quote */}
      <GestureHandlerRootView
        style={{ flex: 1, width: "100%", height: "100%" }}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View
            className="flex-1 justify-center items-center px-8 w-full h-full bg-orange-500"
            style={animatedStyle}
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
                  lineHeight: 48,
                }}
              >
                &ldquo;{currentAffirmation.text}&rdquo;
              </Text>

              {/* Attribution */}
              <Text
                className="pt-10 text-xl font-bold text-center"
                style={{
                  color: "#279089",
                }}
              >
                - {currentAffirmation.category.toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

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
        <TouchableOpacity onPress={handleLikePress} className="flex justify-center items-center p-3" style={{
          marginBottom: 10,
          height: 60,
          width: 60,
        }}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={45}
            color={isLiked ? "#EF4444" : "#F87171"}
          />
        </TouchableOpacity>

        {/* More Options Button */}
        <TouchableOpacity
          onPress={handleMorePress}
          className="justify-center items-center w-full bg-white rounded-full border-2 border-gray-600"
          style={{
            width: 60,
            height: 60,
            borderRadius: 100,
            borderWidth: 2,
            borderColor: "#1e1e1e",
          }}
        >
          <View className="flex-row space-x-1">
            <Ionicons name="ellipsis-horizontal" size={45} color="#F87171" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

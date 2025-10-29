import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ImageBackground,
} from "react-native";
import { AFFIRMATIONS } from "@/constants/Affirmations";
import { Ionicons } from "@expo/vector-icons";
import { useBackground } from "@/contexts/BackgroundContext";
import { useStatsStore } from "@/stores/statsStore";

interface AffirmationsPracticeSessionProps {
  visible: boolean;
  duration: number; // in minutes
  onClose: () => void;
  onRestart: () => void;
}

export const AffirmationsPracticeSession: React.FC<
  AffirmationsPracticeSessionProps
> = ({ visible, duration, onClose, onRestart }) => {
  const { customBackground } = useBackground();
  const { logActivity } = useStatsStore();
  // Calculate total affirmations based on duration (6 per minute)
  const totalAffirmations = duration * 6;
  const affirmationDuration = 10; // 10 seconds per affirmation

  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [affirmationsCompleted, setAffirmationsCompleted] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(affirmationDuration);
  const [likedAffirmations, setLikedAffirmations] = useState<Set<string>>(
    new Set()
  );

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get random affirmations for the session
  const sessionAffirmations = React.useMemo(() => {
    const shuffled = [...AFFIRMATIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalAffirmations);
  }, [totalAffirmations]);

  const startSession = () => {
    setIsActive(true);
    setCurrentAffirmationIndex(0);
    setAffirmationsCompleted(0);
    setTimeRemaining(affirmationDuration);

    // Start the first affirmation
    startAffirmationTimer();
  };

  const startAffirmationTimer = () => {
    setTimeRemaining(affirmationDuration);

    // Reset and start progress animation
    progressAnimation.setValue(0);
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: affirmationDuration * 1000,
      useNativeDriver: false,
    }).start();

    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next affirmation
          nextAffirmation();
          return affirmationDuration;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextAffirmation = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setAffirmationsCompleted((prev) => {
      const newCompleted = prev + 1;

      // Check if we've completed all affirmations
      if (newCompleted >= totalAffirmations) {
        completeSession();
        return newCompleted;
      }

      // Move to next affirmation
      setCurrentAffirmationIndex((prevIndex) => prevIndex + 1);

      // Start next affirmation after a brief pause
      setTimeout(() => {
        startAffirmationTimer();
      }, 500);

      return newCompleted;
    });
  };

  const completeSession = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setIsActive(false);
    setShowSuccess(true);

    // Log completion activity
    logActivity({
      type: "practice_session_completed",
      affirmationCount: totalAffirmations,
      duration: duration,
    });
  };

  const handleRestart = () => {
    setShowSuccess(false);
    onRestart();
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const stopSession = () => {
    setIsActive(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentAffirmationIndex(0);
      setAffirmationsCompleted(0);
      setTimeRemaining(affirmationDuration);
      setIsActive(false);
      setShowSuccess(false);
      setLikedAffirmations(new Set());
    }
  }, [visible]);

  // Handle like button
  const handleLikePress = () => {
    const affirmationId = currentAffirmation?.id;
    if (!affirmationId) return;

    const newLikedAffirmations = new Set(likedAffirmations);
    const isLiked = newLikedAffirmations.has(affirmationId);

    if (isLiked) {
      newLikedAffirmations.delete(affirmationId);
    } else {
      newLikedAffirmations.add(affirmationId);

      // Log like activity
      logActivity({
        type: "affirmation_liked",
        affirmationId: affirmationId,
        affirmationText: currentAffirmation?.text,
        affirmationCategory: currentAffirmation?.category,
      });
    }

    setLikedAffirmations(newLikedAffirmations);
  };

  const currentAffirmation = sessionAffirmations[currentAffirmationIndex];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={stopSession}
    >
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
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1,
          }}
        />

        <View
          style={{
            flex: 1,
            zIndex: 2,
            paddingTop: 15,
            paddingHorizontal: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={stopSession}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
              >
                ×
              </Text>
            </TouchableOpacity>

            {/* Affirmation Counter */}
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              {affirmationsCompleted + 1} of {totalAffirmations} affirmations
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 4,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 2,
              marginBottom: 40,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: 2,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>

          {/* Main Content */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {showSuccess ? (
              // Success Screen
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#20B2AA",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="checkmark" size={48} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Practice Complete!
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 18,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Great job! You completed
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {totalAffirmations} affirmations
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 18,
                    textAlign: "center",
                    marginBottom: 32,
                  }}
                >
                  in {duration} minute{duration > 1 ? "s" : ""}
                </Text>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRestart}
                    style={{
                      backgroundColor: "#20B2AA",
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Restart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : !isActive ? (
              // Start Screen
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Ready to Practice?
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 32,
                    lineHeight: 24,
                  }}
                >
                  You&apos;ll practice {totalAffirmations} affirmations over{" "}
                  {duration} minute{duration > 1 ? "s" : ""}. Each affirmation
                  will be shown for 10 seconds.
                </Text>
                <TouchableOpacity
                  onPress={startSession}
                  style={{
                    backgroundColor: "#20B2AA",
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Start Practice
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Practice Screen
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 40,
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: 50,
                    marginBottom: 20,
                    fontStyle: "italic",
                    fontFamily: "serif",
                    letterSpacing: 1,
                  }}
                >
                  {currentAffirmation?.text}
                </Text>

                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 18,
                    textAlign: "center",
                    marginBottom: 40,
                  }}
                >
                  Say this out loud with confidence
                </Text>

                {/* Time Remaining */}
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {timeRemaining}s
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Heart Icon - Only show during active practice */}
          {isActive && !showSuccess && (
            <View
              style={{
                position: "absolute",
                bottom: 40,
                right: 20,
              }}
            >
              <TouchableOpacity
                onPress={handleLikePress}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={
                    likedAffirmations.has(currentAffirmation?.id || "")
                      ? "heart"
                      : "heart-outline"
                  }
                  size={24}
                  color={
                    likedAffirmations.has(currentAffirmation?.id || "")
                      ? "#EF4444"
                      : "#FFFFFF"
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </Modal>
  );
};

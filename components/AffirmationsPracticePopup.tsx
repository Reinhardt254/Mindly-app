import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";

interface AffirmationsPracticePopupProps {
  visible: boolean;
  onClose: () => void;
  onStartPractice: (duration: number) => void;
}

export const AffirmationsPracticePopup: React.FC<
  AffirmationsPracticePopupProps
> = ({ visible, onClose, onStartPractice }) => {
  const screenWidth = Dimensions.get("window").width;
  const [selectedDuration, setSelectedDuration] = useState(1); // Default to 5 minutes

  const durations = [
    { value: 1, label: "1 minute" },
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
  ];

  const handleStartPractice = () => {
    onStartPractice(selectedDuration);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: screenWidth * 0.85,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#20B2AA",
              backgroundColor: "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "#20B2AA", fontSize: 16, fontWeight: "bold" }}
            >
              ×
            </Text>
          </TouchableOpacity>

          {/* Header Illustration */}
          <View
            style={{
              width: 80,
              height: 80,
              marginBottom: 16,
              position: "relative",
            }}
          >
            {/* Head */}
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#FFDBAC",
                borderRadius: 30,
                position: "absolute",
                top: 10,
                left: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Eyes */}
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#000",
                  borderRadius: 2,
                  position: "absolute",
                  top: 20,
                  left: 20,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#000",
                  borderRadius: 2,
                  position: "absolute",
                  top: 20,
                  right: 20,
                }}
              />
            </View>

            {/* Plants growing from head */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 25,
                width: 30,
                height: 20,
              }}
            >
              {/* Pink flower */}
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#FFB6C1",
                  borderRadius: 4,
                  position: "absolute",
                  top: 2,
                  left: 5,
                }}
              />
              {/* Light blue flower */}
              <View
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: "#ADD8E6",
                  borderRadius: 3,
                  position: "absolute",
                  top: 4,
                  right: 5,
                }}
              />
              {/* Teal leaves */}
              <View
                style={{
                  width: 4,
                  height: 8,
                  backgroundColor: "#20B2AA",
                  borderRadius: 2,
                  position: "absolute",
                  top: 6,
                  left: 12,
                }}
              />
            </View>

            {/* Butterfly */}
            <View
              style={{
                position: "absolute",
                top: 5,
                left: 10,
                width: 12,
                height: 8,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: "#FFA500",
                  borderRadius: 3,
                  position: "absolute",
                  top: 1,
                  left: 3,
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 2,
                  backgroundColor: "#000",
                  borderRadius: 1,
                  position: "absolute",
                  top: 2,
                  left: 4,
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 2,
                  backgroundColor: "#000",
                  borderRadius: 1,
                  position: "absolute",
                  top: 2,
                  right: 4,
                }}
              />
            </View>

            {/* Sparkles */}
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 15,
                width: 4,
                height: 4,
                backgroundColor: "#FFD700",
                borderRadius: 2,
                transform: [{ rotate: "45deg" }],
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 15,
                width: 3,
                height: 3,
                backgroundColor: "#FFD700",
                borderRadius: 1.5,
                transform: [{ rotate: "45deg" }],
              }}
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#333333",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Affirmations Practice
          </Text>

          {/* Instructions */}
          <Text
            style={{
              fontSize: 14,
              color: "#666666",
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
              paddingHorizontal: 8,
            }}
          >
            You&apos;ll see a new affirmation every few seconds. Pronounce it
            clearly, out loud, with full confidence and concentration.
          </Text>

          {/* Duration Selection Buttons */}
          <View style={{ width: "100%", marginBottom: 24 }}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                onPress={() => setSelectedDuration(duration.value)}
                style={{
                  backgroundColor:
                    selectedDuration === duration.value ? "#20B2AA" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#20B2AA",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedDuration === duration.value
                        ? "#FFFFFF"
                        : "#20B2AA",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  {duration.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={handleStartPractice}
            style={{
              backgroundColor: "#20B2AA",
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 32,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Start Practice
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

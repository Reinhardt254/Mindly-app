import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

interface AffirmationsPracticePopupProps {
  visible: boolean;
  onClose: () => void;
  onStartPractice: (duration: number) => void;
}

export const AffirmationsPracticePopup: React.FC<
  AffirmationsPracticePopupProps
> = ({ visible, onClose, onStartPractice }) => {
  const palette = usePalette();
  const [selectedDuration, setSelectedDuration] = useState(1);

  const durations = [1, 5, 10];

  const handleStartPractice = () => {
    onStartPractice(selectedDuration);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheet, { backgroundColor: palette.surface }]}
        >
          <View
            style={[styles.grabber, { backgroundColor: palette.iconRing }]}
          />

          <LinearGradient
            colors={palette.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badge}
          >
            <Ionicons name="mic-outline" size={26} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.title, { color: palette.text }]}>
            Practice out loud
          </Text>
          <Text style={[styles.body, { color: palette.textMuted }]}>
            A new affirmation appears every 10 seconds. Say each one clearly,
            with full confidence.
          </Text>

          <View style={styles.durations}>
            {durations.map((value) => {
              const selected = selectedDuration === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSelectedDuration(value)}
                  activeOpacity={0.8}
                  style={[
                    styles.duration,
                    {
                      backgroundColor: selected
                        ? palette.accentSoft
                        : palette.surfaceMuted,
                      borderColor: selected ? palette.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.durationValue,
                      { color: selected ? palette.accent : palette.text },
                    ]}
                  >
                    {value}
                  </Text>
                  <Text
                    style={[styles.durationUnit, { color: palette.textMuted }]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton
            title="Start practice"
            icon="play"
            onPress={handleStartPractice}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 8, 20, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 22,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginBottom: 6,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: Fonts.regular,
    marginBottom: 22,
  },
  durations: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  duration: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  durationValue: {
    fontSize: 22,
    fontFamily: Fonts.bold,
  },
  durationUnit: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});

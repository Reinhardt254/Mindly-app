import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

interface PopupButton {
  text: string;
  onPress: () => void;
  style?: "default" | "destructive" | "cancel";
}

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: PopupButton[];
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const palette = usePalette();

  const getButtonColors = (style?: PopupButton["style"]) => {
    switch (style) {
      case "destructive":
        return { backgroundColor: palette.danger, color: "#FFFFFF" };
      case "cancel":
        return { backgroundColor: palette.surfaceMuted, color: palette.text };
      default:
        return { backgroundColor: palette.accent, color: "#FFFFFF" };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.textMuted }]}>
            {message}
          </Text>

          <View
            style={[
              styles.buttons,
              buttons.length === 2 && styles.buttonsRow,
            ]}
          >
            {buttons.map((button, index) => {
              const colors = getButtonColors(button.style);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.button,
                    buttons.length === 2 && styles.buttonFlex,
                    { backgroundColor: colors.backgroundColor },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: colors.color }]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 8, 20, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: Radius.lg,
    padding: 24,
  },
  title: {
    fontSize: 19,
    fontFamily: Fonts.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: 22,
  },
  buttons: {
    gap: 10,
  },
  buttonsRow: {
    flexDirection: "row",
  },
  button: {
    paddingVertical: 13,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  buttonFlex: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
});

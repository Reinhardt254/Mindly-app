import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, usePalette } from "@/constants/Theme";

interface MenuOption {
  text: string;
  icon: string;
  onPress: () => void;
  style?: "default" | "destructive";
}

interface SideMenuProps {
  visible: boolean;
  options: MenuOption[];
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  options,
  onClose,
}) => {
  const palette = usePalette();

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
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View
            style={[styles.grabber, { backgroundColor: palette.iconRing }]}
          />
          {options.map((option, index) => {
            const color =
              option.style === "destructive" ? palette.danger : palette.text;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                style={styles.option}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        option.style === "destructive"
                          ? palette.dangerSoft
                          : palette.surfaceMuted,
                    },
                  ]}
                >
                  <Ionicons name={option.icon as any} size={18} color={color} />
                </View>
                <Text style={[styles.optionText, { color }]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
});

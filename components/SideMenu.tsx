import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const colorScheme = useColorScheme();

  const getTextColor = (style?: string) => {
    switch (style) {
      case "destructive":
        return "#EF4444";
      default:
        return Colors[colorScheme ?? "light"].text;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderRadius: 12,
            paddingVertical: 8,
            marginRight: 20,
            marginTop: 100,
            minWidth: 180,
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
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                option.onPress();
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
                borderBottomColor:
                  Colors[colorScheme ?? "light"].tabIconDefault,
              }}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={getTextColor(option.style)}
                style={{ marginRight: 12 }}
              />
              <Text
                className="text-base font-medium"
                style={{
                  color: getTextColor(option.style),
                }}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

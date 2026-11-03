import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get("window").width;

  const getButtonStyle = (style: string) => {
    switch (style) {
      case "destructive":
        return {
          backgroundColor: "#EF4444",
        };
      case "cancel":
        return {
          backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault,
        };
      default:
        return {
          backgroundColor: Colors[colorScheme ?? "light"].highlight,
        };
    }
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
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: screenWidth * 0.85,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
          <Text
            style={[
              styles.title,
              {
                color: Colors[colorScheme ?? "light"].text,
                fontSize: 20,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: Colors[colorScheme ?? "light"].text,
                lineHeight: 22,
                fontSize: 16,
              },
            ]}
          >
            {message}
          </Text>

          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
                style={{
                  ...getButtonStyle(button.style || "default"),
                  paddingVertical: 7,
                  paddingHorizontal: 20,
                  width: "auto" as any,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: "#FFFFFF",
                    },
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

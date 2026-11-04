import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useBackground } from "@/contexts/BackgroundContext";
import { Popup } from "@/components/Popup";
import { Card, ListRow, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const GRID_GAP = 10;
const TILE_WIDTH = (width - 40 - GRID_GAP * 2) / 3;

export default function ThemeScreen() {
  const palette = usePalette();
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });
  const { customBackground, setCustomBackground, resetBackground } =
    useBackground();

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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showPopup(
        "Permission required",
        "Please grant permission to access your photo library to change the background.",
        [{ text: "OK", onPress: () => {} }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await AsyncStorage.setItem("customBackground", asset.uri);
        setCustomBackground(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showPopup(
        "Something went wrong",
        "Failed to update background image. Please try again.",
        [{ text: "OK", onPress: () => {} }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = () => {
    showPopup(
      "Reset background",
      "Are you sure you want to go back to the default background?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetBackground();
            } catch (error) {
              console.error("Error resetting background:", error);
              showPopup(
                "Error",
                "Failed to reset background. Please try again.",
                [{ text: "OK", onPress: () => {} }]
              );
            }
          },
        },
      ]
    );
  };

  const defaultSource = require("@/assets/images/home.jpg");
  const currentSource = customBackground
    ? { uri: customBackground }
    : defaultSource;

  return (
    <Screen title="Background">
      {/* Preview */}
      <ImageBackground
        source={currentSource}
        style={styles.preview}
        imageStyle={styles.previewImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(22,16,48,0.35)", "rgba(22,16,48,0.75)"]}
          style={[StyleSheet.absoluteFill, styles.previewImage]}
        />
        <View style={[styles.previewBadge, { backgroundColor: palette.accent }]}>
          <Ionicons name="heart" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.previewText}>
          I am allowed to ask for what I want
        </Text>
      </ImageBackground>

      <SectionLabel>Choose</SectionLabel>
      <View style={styles.grid}>
        <Tile
          source={defaultSource}
          label="Default"
          selected={!customBackground}
          onPress={customBackground ? resetToDefault : undefined}
        />
        {customBackground && (
          <Tile
            source={{ uri: customBackground }}
            label="Yours"
            selected
          />
        )}
        <TouchableOpacity
          onPress={pickImage}
          disabled={isLoading}
          activeOpacity={0.8}
          style={[
            styles.tile,
            styles.uploadTile,
            { borderColor: palette.accent, backgroundColor: palette.accentSoft },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <>
              <Ionicons name="add" size={26} color={palette.accent} />
              <Text style={[styles.uploadText, { color: palette.accent }]}>
                Upload
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {customBackground && (
        <Card style={styles.resetCard}>
          <ListRow
            icon="refresh-outline"
            label="Reset to default"
            onPress={resetToDefault}
            destructive
            isLast
          />
        </Card>
      )}

      <Text style={[styles.note, { color: palette.textMuted }]}>
        Images are cropped to 9:16 and stored only on your device.
      </Text>

      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </Screen>
  );
}

function Tile({
  source,
  label,
  selected,
  onPress,
}: {
  source: any;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const palette = usePalette();
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      <ImageBackground
        source={source}
        style={[
          styles.tile,
          selected && { borderWidth: 2, borderColor: palette.accent },
        ]}
        imageStyle={styles.tileImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          style={[StyleSheet.absoluteFill, styles.tileImage]}
        />
        {selected && (
          <View style={[styles.check, { backgroundColor: palette.accent }]}>
            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
          </View>
        )}
        <Text style={styles.tileLabel}>{label}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: width * 0.95,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  previewImage: {
    borderRadius: Radius.lg,
  },
  previewBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  previewText: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 32,
    fontFamily: Fonts.bold,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.35,
    borderRadius: Radius.md,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  tileImage: {
    borderRadius: Radius.md,
  },
  tileLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Fonts.semibold,
  },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTile: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    paddingBottom: 0,
    gap: 4,
  },
  uploadText: {
    fontSize: 13,
    fontFamily: Fonts.semibold,
  },
  resetCard: {
    marginTop: 18,
  },
  note: {
    marginTop: 18,
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
});

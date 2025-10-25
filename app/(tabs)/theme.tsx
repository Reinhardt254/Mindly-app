import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useBackground } from "@/contexts/BackgroundContext";
import { SimpleHeader } from "@/components/ModernHeader";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function ThemeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { customBackground, setCustomBackground, resetBackground } =
    useBackground();
  const colorScheme = useColorScheme();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photo library to change the background."
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Save the image URI directly to AsyncStorage and update context
        await AsyncStorage.setItem("customBackground", asset.uri);
        setCustomBackground(asset.uri);

        Alert.alert("Success", "Background image updated successfully!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to update background image. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      "Reset Background",
      "Are you sure you want to reset to the default background?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetBackground();
              Alert.alert("Success", "Background reset to default!");
            } catch (error) {
              console.error("Error resetting background:", error);
              Alert.alert(
                "Error",
                "Failed to reset background. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      {/* Simple Header */}
      <SimpleHeader title="Theme" />

      <ScrollView className="flex-1 px-0 py-0">
        {/* Current Background Card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="image"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
            />
            <Text style={styles.cardTitle}>Current Background</Text>
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  customBackground
                    ? { uri: customBackground }
                    : require("@/assets/images/home.jpg")
                }
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.statusBadge}>
                  <Ionicons
                    name={customBackground ? "checkmark-circle" : "home"}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {customBackground ? "Custom" : "Default"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={isLoading}
            style={[styles.primaryButton, { opacity: isLoading ? 0.6 : 1 }]}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>
                  {isLoading ? "Uploading..." : "Upload New Background"}
                </Text>
                <Text style={styles.buttonSubtitle}>
                  Choose from your gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {customBackground && (
            <TouchableOpacity
              onPress={resetToDefault}
              style={styles.secondaryButton}
            >
              <View style={styles.buttonContent}>
                <View
                  style={[
                    styles.buttonIcon,
                    { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                  ]}
                >
                  <Ionicons name="refresh" size={20} color="#EF4444" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, { color: "#EF4444" }]}>
                    Reset to Default
                  </Text>
                  <Text style={styles.buttonSubtitleReset}>
                    Remove custom background
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Privacy First</Text>
              <Text style={styles.infoDescription}>
                All images are stored locally on your device
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="resize" size={24} color="#3B82F6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Perfect Fit</Text>
              <Text style={styles.infoDescription}>
                Images are automatically cropped to 9:16 ratio
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Instant Updates</Text>
              <Text style={styles.infoDescription}>
                Changes appear immediately across the app
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerContainer: {
    backgroundColor: "#279089",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },

  // Card Styles
  cardContainer: {
    backgroundColor: "transparent",
    marginHorizontal: 10,
    borderRadius: 0,
    padding: 0,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#1F2937",
  },
  previewContainer: {
    alignItems: "center",
  },
  imageContainer: {
    width: width * 0.95,
    height: width * 1 * 1.5,
    borderRadius: 15,
    overflow: "hidden",
    padding: 0,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Action Button Styles
  actionsContainer: {
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "#279089",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#279089",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "#ffffff",
  },

  buttonSubtitleReset: {
    fontSize: 14,
    color: "#000000",
  },

  // Info Card Styles
  infoContainer: {
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});

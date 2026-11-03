import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const colorScheme = useColorScheme();
  if (!isOpen) return null;

  const navigationItems = [
    { name: "Home", icon: "home", route: "/(tabs)/" as const },
    { name: "Categories", icon: "apps", route: "/(tabs)/categories" as const },
    { name: "Favorites", icon: "heart", route: "/(tabs)/favorites" as const },
    { name: "Add", icon: "add-circle", route: "/(tabs)/add" as const },
    { name: "Profile", icon: "person", route: "/(tabs)/profile" as const },
    { name: "Settings", icon: "settings", route: "/(tabs)/settings" as const },
    { name: "Stats", icon: "bar-chart", route: "/(tabs)/stats" as const },
    { name: "Theme", icon: "color-palette", route: "/(tabs)/theme" as const },
  ];

  const handleNavigation = (route: any) => {
    router.push(route);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity style={styles.overlay} onPress={onClose} />

      {/* Sidebar */}
      <View
        style={[
          styles.sidebar,
          {
            backgroundColor: Colors[colorScheme ?? "light"].sidebarBackground,
            paddingTop: 60,
            paddingHorizontal: 20,
          },
        ]}
      >
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons
            name="close"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>

        {/* Navigation Items */}
        <View style={styles.navList}>
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigation(item.route)}
              style={[
                styles.navItem,
                {
                  backgroundColor:
                    Colors[colorScheme ?? "light"].sidebarBackground,
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={Colors[colorScheme ?? "light"].text}
                style={{ marginRight: 16 }}
              />
              <Text
                style={[
                  styles.navText,
                  { color: Colors[colorScheme ?? "light"].text },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    backgroundColor: "rgba(0,0,0,0.31)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 50,
    flexDirection: "column",
    width: 256,
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    padding: 8,
    top: 16,
    right: 16,
  },
  navList: {
    gap: 16,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  navText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
});

import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
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
      <TouchableOpacity
        className="absolute inset-0 z-40 bg-[#00000050] bg-opacity-50"
        onPress={onClose}
      />

      {/* Sidebar */}
      <View
        className="absolute top-0 left-0 z-50 flex-col w-64 h-full"
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].sidebarBackground,
          paddingTop: 60,
          paddingHorizontal: 20,
        }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute p-2 top-4 right-4"
        >
          <Ionicons
            name="close"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>

        {/* Navigation Items */}
        <View className="space-y-4">
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigation(item.route)}
              className="flex-row items-center p-4 rounded-lg"
              style={{
                backgroundColor:
                  Colors[colorScheme ?? "light"].sidebarBackground,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={Colors[colorScheme ?? "light"].text}
                style={{ marginRight: 16 }}
              />
              <Text
                className="text-lg font-medium text-white"
                style={{ color: Colors[colorScheme ?? "light"].text }}
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

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface PolicyPageProps {
  title: string;
  content: string;
  showBackButton?: boolean;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  title,
  content,
  showBackButton = true,
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
    >
      <ScrollView style={styles.scroll}>
        <View style={{ height: 20 }}></View>

        {/* Header */}
        <View style={styles.header}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          <Text
            style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.updated,
              { color: Colors[colorScheme ?? "light"].text },
            ]}
          >
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Content */}
        <View
          style={[
            styles.contentBox,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 0,
              paddingHorizontal: colorScheme === "dark" ? 0 : 0,
              margin: 0,
              marginBottom: 5,
              // boxShadow:
              //   colorScheme === "dark"
              //     ? ""
              //     : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            },
          ]}
        >
          <Text
            style={[
              styles.contentText,
              { color: Colors[colorScheme ?? "light"].text, fontSize: 16 },
            ]}
          >
            {content}
          </Text>
        </View>

        <View
          style={[
            styles.spacer,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              height: 120,
            },
          ]}
        ></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  header: {
    marginBottom: 0,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 18,
    color: "#3b82f6",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  updated: {
    marginTop: 8,
    fontSize: 16,
  },
  contentBox: {
    borderRadius: 8,
  },
  contentText: {
    lineHeight: 24,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
});

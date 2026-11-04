import React from "react";
import { Text, StyleSheet } from "react-native";
import { Card, Screen } from "@/components/ui/Kit";
import { Fonts, usePalette } from "@/constants/Theme";

interface PolicyPageProps {
  title: string;
  content: string;
  showBackButton?: boolean;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ title, content }) => {
  const palette = usePalette();

  return (
    <Screen title={title}>
      <Text style={[styles.updated, { color: palette.textMuted }]}>
        Last updated {new Date().toLocaleDateString()}
      </Text>
      <Card style={styles.card}>
        <Text style={[styles.content, { color: palette.text }]}>{content}</Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  updated: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginBottom: 14,
    marginLeft: 2,
  },
  card: {
    paddingVertical: 18,
  },
  content: {
    fontSize: 14.5,
    lineHeight: 23,
    fontFamily: Fonts.regular,
  },
});

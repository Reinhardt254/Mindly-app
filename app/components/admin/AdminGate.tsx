import React from "react";
import { ActivityIndicator } from "react-native";
import { EmptyState, Screen } from "@/components/ui/Kit";
import { usePalette } from "@/constants/Theme";
import { useMe } from "@/hooks/useApi";

export function AdminGate({ title, children }: { title: string; children: React.ReactNode }) {
  const palette = usePalette();
  const me = useMe();

  if (me.isLoading) {
    return (
      <Screen title={title}>
        <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (me.data?.role !== "ADMIN") {
    return (
      <Screen title={title}>
        <EmptyState icon="lock-closed-outline" title="Admins only" subtitle="This page is for admin accounts." />
      </Screen>
    );
  }

  return <>{children}</>;
}

import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AdminGate } from "@/components/admin/AdminGate";
import { Popup } from "@/components/Popup";
import { Card, EmptyState, Screen, SectionLabel } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { AdminAccount, useAdminOverview, useAdminRoleMutations, useAdminUsers, useMe } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";

type Action = "promote" | "demote" | "suspend" | "activate" | "delete";

export default function AdminAccountsScreen() {
  const palette = usePalette();
  const me = useMe();
  const isAdmin = me.data?.role === "ADMIN";
  const overview = useAdminOverview(isAdmin);
  const [query, setQuery] = useState("");
  const users = useAdminUsers(query.trim(), isAdmin);
  const roles = useAdminRoleMutations();
  const [pending, setPending] = useState<{ action: Action; account: AdminAccount } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastAdmin = (overview.data?.admins ?? 1) <= 1;
  const items = users.data?.items ?? [];

  const confirm = async () => {
    if (!pending) return;
    setError(null);
    try {
      const { action, account } = pending;
      if (action === "promote") await roles.promote.mutateAsync(account.email);
      if (action === "demote") await roles.demote.mutateAsync(account.id);
      if (action === "suspend") await roles.suspend.mutateAsync(account.id);
      if (action === "activate") await roles.activate.mutateAsync(account.id);
      if (action === "delete") await roles.remove.mutateAsync(account.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't update that account.");
    }
  };

  const copy = pending
    ? {
        promote: ["Make admin", `${pending.account.email} will be able to open admin and use every premium feature.`],
        demote: ["Remove admin", `${pending.account.email} will lose admin access.`],
        suspend: ["Suspend account", `${pending.account.email} will be signed out and unable to sign in.`],
        activate: ["Activate account", `${pending.account.email} will be able to sign in again.`],
        delete: ["Delete account", `This permanently deletes ${pending.account.email}, including favorites, moods, and recordings.`],
      }[pending.action]
    : ["", ""];

  return (
    <AdminGate title="Accounts">
      <Screen title="Accounts">
        <SectionLabel>Find someone</SectionLabel>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or email"
          placeholderTextColor={palette.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
        />
        <Text style={[styles.note, { color: palette.textMuted }]}>
          Someone needs an account before you can make them an admin.
        </Text>
        {error && <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>}

        {users.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginTop: 24 }} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No accounts"
            subtitle={query.includes("@") ? "No account with that email. They need to sign up first." : "No accounts match that search."}
          />
        ) : (
          <Card>
            {items.map((account, index) => {
              const isSelf = account.id === me.data?.user.id;
              const protectedAdmin = account.role === "ADMIN" && lastAdmin;
              return (
                <View
                  key={account.id}
                  style={[
                    styles.row,
                    index < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
                  ]}
                >
                  <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>{account.name}</Text>
                  <Text style={[styles.email, { color: palette.textMuted }]} numberOfLines={1}>{account.email}</Text>
                  <Text style={[styles.meta, { color: palette.textMuted }]}>
                    {account.role === "ADMIN" ? "Admin" : "User"}
                    {account.premium ? " · Premium" : ""}
                    {" · "}
                    {account.status === "SUSPENDED" ? "Suspended" : "Active"}
                  </Text>
                  {isSelf || protectedAdmin ? (
                    <Text style={[styles.meta, { color: palette.textMuted }]}>{isSelf ? "This is you" : "Last admin"}</Text>
                  ) : (
                    <View style={styles.actions}>
                      <Action
                        label={account.role === "ADMIN" ? "Remove admin" : "Make admin"}
                        color={palette.accent}
                        onPress={() => setPending({ action: account.role === "ADMIN" ? "demote" : "promote", account })}
                      />
                      <Action
                        label={account.status === "SUSPENDED" ? "Activate" : "Suspend"}
                        color={palette.text}
                        onPress={() => setPending({ action: account.status === "SUSPENDED" ? "activate" : "suspend", account })}
                      />
                      <Action label="Delete" color={palette.danger} onPress={() => setPending({ action: "delete", account })} />
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
        )}

        <Popup
          visible={!!pending}
          title={copy[0]}
          message={copy[1]}
          buttons={[
            { text: "Cancel", onPress: () => {}, style: "cancel" },
            {
              text: copy[0],
              style: pending?.action === "delete" || pending?.action === "suspend" || pending?.action === "demote" ? "destructive" : "default",
              onPress: confirm,
            },
          ]}
          onClose={() => setPending(null)}
        />
      </Screen>
    </AdminGate>
  );
}

function Action({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.action}>
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  note: { fontSize: 12.5, lineHeight: 18, fontFamily: Fonts.regular, marginTop: 8, marginBottom: 12 },
  error: { fontSize: 13, fontFamily: Fonts.medium, marginBottom: 12 },
  row: { paddingVertical: 12, gap: 2 },
  name: { fontSize: 15, fontFamily: Fonts.semibold },
  email: { fontSize: 13, fontFamily: Fonts.regular },
  meta: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 8 },
  action: { paddingVertical: 2 },
  actionText: { fontSize: 13, fontFamily: Fonts.semibold },
});

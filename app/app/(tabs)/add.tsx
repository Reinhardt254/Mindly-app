import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Popup } from "@/components/Popup";
import { SideMenu } from "@/components/SideMenu";
import { EmptyState, PrimaryButton, Screen } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import {
  CustomAffirmationDto,
  useCustomAffirmationMutations,
  useCustomAffirmations,
} from "@/hooks/useApi";
import { ApiError } from "@/lib/api";

type PopupButton = {
  text: string;
  onPress: () => void;
  style?: "default" | "destructive" | "cancel";
};

export default function AddScreen() {
  const palette = usePalette();
  const router = useRouter();
  const custom = useCustomAffirmations();
  const { create, update, remove } = useCustomAffirmationMutations();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [text, setText] = useState("");
  const [menuFor, setMenuFor] = useState<CustomAffirmationDto | null>(null);
  const [editing, setEditing] = useState<CustomAffirmationDto | null>(null);
  const [popup, setPopup] = useState<{ title: string; message: string; buttons: PopupButton[] } | null>(null);

  const items = custom.data?.items ?? [];
  const limit = custom.data?.limit ?? null;
  const atLimit = limit !== null && items.length >= limit;

  const showPopup = (title: string, message: string, buttons: PopupButton[]) =>
    setPopup({ title, message, buttons });

  const showUpsell = () =>
    showPopup(
      "You've reached the free limit",
      `Free accounts can keep ${limit ?? 5} of their own affirmations. Go Premium for unlimited.`,
      [
        { text: "See Premium", onPress: () => router.push("/paywall") },
        { text: "Not now", onPress: () => {}, style: "cancel" },
      ],
    );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const closeModal = () => {
    setIsModalVisible(false);
    setEditing(null);
    setText("");
  };

  const openNew = () => {
    if (atLimit) {
      showUpsell();
      return;
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      if (editing) await update.mutateAsync({ id: editing.id, text: trimmed });
      else await create.mutateAsync({ text: trimmed });
      closeModal();
    } catch (e) {
      closeModal();
      if (e instanceof ApiError && e.isPremiumRequired) showUpsell();
      else
        showPopup("Couldn't save", e instanceof Error ? e.message : "Please try again.", [
          { text: "OK", onPress: () => {} },
        ]);
    }
  };

  const handleRemove = (id: string) => {
    showPopup("Delete affirmation", "This can't be undone.", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Delete",
        onPress: () => remove.mutate(id),
        style: "destructive",
      },
    ]);
  };

  const getSideMenuOptions = (affirmation: CustomAffirmationDto) => [
    {
      text: "Edit",
      icon: "create-outline",
      onPress: () => {
        setEditing(affirmation);
        setText(affirmation.text);
        setIsModalVisible(true);
        setMenuFor(null);
      },
    },
    {
      text: affirmation.isEnabled ? "Hide from feed" : "Show in feed",
      icon: affirmation.isEnabled ? "eye-off-outline" : "eye-outline",
      onPress: () => {
        update.mutate({ id: affirmation.id, isEnabled: !affirmation.isEnabled });
        setMenuFor(null);
      },
    },
    {
      text: "Delete",
      icon: "trash-outline",
      onPress: () => {
        setMenuFor(null);
        handleRemove(affirmation.id);
      },
      style: "destructive" as const,
    },
  ];

  return (
    <Screen
      title="Your Affirmations"
      right={
        limit !== null ? (
          <Text style={[styles.counter, { color: palette.textMuted }]}>
            {items.length}/{limit}
          </Text>
        ) : undefined
      }
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            title="New affirmation"
            icon="add"
            onPress={openNew}
          />
        </View>
      }
    >
      {custom.isLoading ? (
        <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="Write your own"
          subtitle="Affirmations in your own words hit different. They'll show up in your feed and reminders."
        />
      ) : (
        <View style={styles.list}>
          {items.map((affirmation) => (
            <View
              key={affirmation.id}
              style={[
                styles.card,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  opacity: affirmation.isEnabled ? 1 : 0.55,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.quote, { color: palette.text }]}>
                  {affirmation.text}
                </Text>
                <TouchableOpacity onPress={() => setMenuFor(affirmation)} hitSlop={10}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={palette.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.date, { color: palette.textMuted }]}>
                {formatDate(affirmation.createdAt)}
                {affirmation.source === "ai" ? " · AI" : ""}
                {affirmation.isEnabled ? "" : " · hidden"}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
            <View style={[styles.grabber, { backgroundColor: palette.iconRing }]} />
            <Text style={[styles.sheetTitle, { color: palette.text }]}>
              {editing ? "Edit affirmation" : "New affirmation"}
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="I am..."
              placeholderTextColor={palette.textMuted}
              multiline
              maxLength={1000}
              autoFocus
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceMuted,
                  color: palette.text,
                },
              ]}
            />
            <Text style={[styles.count, { color: palette.textMuted }]}>
              {text.length}/1000
            </Text>
            <PrimaryButton
              title={editing ? "Update" : "Save"}
              onPress={handleSave}
              loading={create.isPending || update.isPending}
              disabled={text.trim().length === 0}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SideMenu
        visible={!!menuFor}
        options={menuFor ? getSideMenuOptions(menuFor) : []}
        onClose={() => setMenuFor(null)}
      />

      <Popup
        visible={!!popup}
        title={popup?.title ?? ""}
        message={popup?.message ?? ""}
        buttons={popup?.buttons ?? []}
        onClose={() => setPopup(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  counter: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  quote: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: Fonts.semibold,
  },
  date: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 8, 20, 0.45)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 16,
  },
  input: {
    minHeight: 120,
    borderRadius: Radius.md,
    padding: 16,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: Fonts.medium,
    textAlignVertical: "top",
  },
  count: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: "right",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useStatsStore, CustomAffirmation } from "@/stores/statsStore";
import { SimpleHeader } from "@/components/ModernHeader";
import { Popup } from "@/components/Popup";
import { SideMenu } from "@/components/SideMenu";

export default function AddScreen() {
  const colorScheme = useColorScheme();
  const {
    logActivity,
    customAffirmations,
    addCustomAffirmation,
    updateCustomAffirmation,
    removeCustomAffirmation,
    toggleCustomAffirmation,
  } = useStatsStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAffirmationText, setNewAffirmationText] = useState("");
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  const [selectedAffirmationId, setSelectedAffirmationId] = useState<
    string | null
  >(null);
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
  const [editingAffirmation, setEditingAffirmation] =
    useState<CustomAffirmation | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleSaveAffirmation = () => {
    if (newAffirmationText.trim().length === 0) {
      showPopup("Error", "Please enter an affirmation text", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    if (newAffirmationText.length > 1000) {
      showPopup("Error", "Affirmation text must be 1000 characters or less", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    addCustomAffirmation({
      text: newAffirmationText.trim(),
      category: "Custom",
      isEnabled: true,
    });

    setNewAffirmationText("");
    setIsModalVisible(false);

    // Log activity
    logActivity({
      type: "affirmation_viewed",
      affirmationId: "custom",
      affirmationText: newAffirmationText.trim(),
      affirmationCategory: "Custom",
    });

    showPopup("Success", "Custom affirmation added!", [
      { text: "OK", onPress: () => {} },
    ]);
  };

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

  const handleEditAffirmation = (affirmation: CustomAffirmation) => {
    setEditingAffirmation(affirmation);
    setNewAffirmationText(affirmation.text);
    setIsModalVisible(true);
    setIsSideMenuVisible(false);
  };

  const handleUpdateAffirmation = () => {
    if (!editingAffirmation) return;

    if (newAffirmationText.trim().length === 0) {
      showPopup("Error", "Please enter an affirmation text", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    if (newAffirmationText.length > 1000) {
      showPopup("Error", "Affirmation text must be 1000 characters or less", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    updateCustomAffirmation(editingAffirmation.id, {
      text: newAffirmationText.trim(),
    });

    setNewAffirmationText("");
    setEditingAffirmation(null);
    setIsModalVisible(false);

    showPopup("Success", "Affirmation updated!", [
      { text: "OK", onPress: () => {} },
    ]);
  };

  const handleSaveToFavorites = (affirmation: CustomAffirmation) => {
    // Log as liked activity
    logActivity({
      type: "affirmation_liked",
      affirmationId: affirmation.id,
      affirmationText: affirmation.text,
      affirmationCategory: affirmation.category,
    });

    showPopup(
      "Added to Favorites",
      "This affirmation has been saved to your favorites!",
      [{ text: "OK", onPress: () => {} }]
    );
    setIsSideMenuVisible(false);
  };

  const handleRemoveAffirmation = (id: string) => {
    showPopup(
      "Remove Affirmation",
      "Are you sure you want to remove this affirmation?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            removeCustomAffirmation(id);
            showPopup("Removed", "Affirmation removed", [
              { text: "OK", onPress: () => {} },
            ]);
          },
          style: "destructive",
        },
      ]
    );
  };

  const getSideMenuOptions = (affirmation: CustomAffirmation) => [
    {
      text: "Edit",
      icon: "create-outline",
      onPress: () => handleEditAffirmation(affirmation),
    },
    {
      text: "Save to Favorites",
      icon: "heart-outline",
      onPress: () => handleSaveToFavorites(affirmation),
    },
    {
      text: "Delete",
      icon: "trash-outline",
      onPress: () => handleRemoveAffirmation(affirmation.id),
      style: "destructive" as const,
    },
  ];

  const handleToggleAffirmation = (id: string) => {
    toggleCustomAffirmation(id);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      ]}
    >
      {/* Header */}
      <SimpleHeader title="Add" />

      {/* Content */}
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {customAffirmations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="add-circle-outline"
              size={64}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
              style={styles.emptyIcon}
            />
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              No Custom Affirmations Yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                {
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
            >
              Add your own affirmations to personalize your experience
            </Text>
          </View>
        ) : (
          customAffirmations.map((affirmation) => (
            <View
              key={affirmation.id}
              style={[
                styles.affirmationItem,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                  borderBottomColor:
                    Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
            >
              <View style={styles.affirmationRow}>
                <View style={styles.affirmationTextContainer}>
                  <Text
                    style={[
                      styles.affirmationText,
                      {
                        color: Colors[colorScheme ?? "light"].text,
                      },
                    ]}
                  >
                    {affirmation.text}
                  </Text>
                  <Text
                    style={[
                      styles.affirmationDate,
                      {
                        color: Colors[colorScheme ?? "light"].tabIconDefault,
                      },
                    ]}
                  >
                    {formatDate(affirmation.createdAt)}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleToggleAffirmation(affirmation.id)}
                    style={styles.toggleButton}
                  >

                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAffirmationId(affirmation.id);
                      setIsSideMenuVisible(true);
                    }}
                    style={styles.menuButton}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={Colors[colorScheme ?? "light"].highlight}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Affirmation Button */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[
          styles.addButton,
          {
            backgroundColor: Colors[colorScheme ?? "light"].highlight,
          },
        ]}
      >
        <Text style={styles.addButtonText}>Add affirmation</Text>
      </TouchableOpacity>

      {/* Add Affirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            >
              {editingAffirmation
                ? "Edit affirmation"
                : "Add a new affirmation"}
            </Text>

            <TextInput
              value={newAffirmationText}
              onChangeText={setNewAffirmationText}
              placeholder="Enter your affirmation..."
              placeholderTextColor={
                Colors[colorScheme ?? "light"].tabIconDefault
              }
              multiline
              numberOfLines={4}
              maxLength={1000}
              style={[
                styles.textInput,
                {
                  borderBottomColor: Colors[colorScheme ?? "light"].highlight,
                  color: Colors[colorScheme ?? "light"].text,
                },
              ]}
            />

            <Text
              style={[
                styles.charCount,
                {
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                },
              ]}
            >
              {newAffirmationText.length}/1000
            </Text>

            <TouchableOpacity
              onPress={
                editingAffirmation
                  ? handleUpdateAffirmation
                  : handleSaveAffirmation
              }
              style={[
                styles.saveButton,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].highlight,
                },
              ]}
            >
              <Text style={styles.saveButtonText}>
                {editingAffirmation ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Side Menu */}
      <SideMenu
        visible={isSideMenuVisible}
        options={
          selectedAffirmationId
            ? getSideMenuOptions(
                customAffirmations.find((a) => a.id === selectedAffirmationId)!
              )
            : []
        }
        onClose={() => {
          setIsSideMenuVisible(false);
          setSelectedAffirmationId(null);
        }}
      />

      {/* Popup */}
      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20,
  },
  affirmationItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  affirmationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  affirmationTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  affirmationText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  affirmationDate: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuButton: {
    padding: 8,
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 24,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  textInput: {
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: "auto",
  },
  charCount: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "right",
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
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
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      {/* Header */}
      <SimpleHeader title="Add" />

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        {customAffirmations.length === 0 ? (
          <View
            className="items-center justify-center flex-1"
            style={{
              paddingVertical: 60,
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={64}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
              style={{ marginBottom: 16 }}
            />
            <Text
              className="text-lg font-semibold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
                marginBottom: 8,
              }}
            >
              No Custom Affirmations Yet
            </Text>
            <Text
              className="text-center"
              style={{
                color: Colors[colorScheme ?? "light"].tabIconDefault,
                lineHeight: 20,
              }}
            >
              Add your own affirmations to personalize your experience
            </Text>
          </View>
        ) : (
          customAffirmations.map((affirmation) => (
            <View
              key={affirmation.id}
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
                paddingVertical: 0,
                paddingHorizontal: 0,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor:
                  Colors[colorScheme ?? "light"].tabIconDefault,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1" style={{ marginRight: 16 }}>
                  <Text
                    className="text-base leading-6"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                      marginBottom: 8,
                    }}
                  >
                    {affirmation.text}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: Colors[colorScheme ?? "light"].tabIconDefault,
                    }}
                  >
                    {formatDate(affirmation.createdAt)}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleToggleAffirmation(affirmation.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                    }}
                  >

                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAffirmationId(affirmation.id);
                      setIsSideMenuVisible(true);
                    }}
                    style={{
                      padding: 8,
                    }}
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
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].highlight,
          marginHorizontal: 20,
          marginBottom: 20,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text
          className="text-lg font-semibold"
          style={{
            color: "#FFFFFF",
          }}
        >
          Add affirmation
        </Text>
      </TouchableOpacity>

      {/* Add Affirmation Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
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
            }}
          >
            <Text
              className="mb-6 text-xl font-bold text-center"
              style={{
                color: Colors[colorScheme ?? "light"].text,
              }}
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
              style={{
                borderBottomWidth: 2,
                borderBottomColor: Colors[colorScheme ?? "light"].highlight,
                paddingVertical: 12,
                paddingHorizontal: 0,
                fontSize: 16,
                color: Colors[colorScheme ?? "light"].text,
                textAlignVertical: "top",
                minHeight: "auto",
              }}
            />

            <Text
              className="mt-2 text-sm text-right"
              style={{
                color: Colors[colorScheme ?? "light"].tabIconDefault,
              }}
            >
              {newAffirmationText.length}/1000
            </Text>

            <TouchableOpacity
              onPress={
                editingAffirmation
                  ? handleUpdateAffirmation
                  : handleSaveAffirmation
              }
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].highlight,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text
                className="text-lg font-semibold"
                style={{
                  color: "#FFFFFF",
                }}
              >
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

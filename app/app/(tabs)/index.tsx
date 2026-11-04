import { findCategory } from "@/constants/Affirmations";
import { Affirmation } from "@/constants/UserTypes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  useAffirmationFeed,
  useCategories,
  useFavorites,
  useToggleFavorite,
  useVoiceRecordings,
} from "@/hooks/useApi";
import { trackActivity } from "@/lib/activity";
import { shareAsImage, shareAsText } from "@/lib/share";
import { useIsPremium } from "@/stores/premiumStore";
import { timeUtils } from "@/utils/timeUtils";
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { MoodCheckinSheet } from "@/components/MoodCheckinSheet";
import { ShareCard } from "@/components/ShareCard";
import { VoiceRecorderSheet } from "@/components/VoiceRecorderSheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBackground } from "@/contexts/BackgroundContext";
import { useStatsStore } from "@/stores/statsStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Popup } from "@/components/Popup";
import { AffirmationsPracticePopup } from "@/components/AffirmationsPracticePopup";
import { AffirmationsPracticeSession } from "@/components/AffirmationsPracticeSession";
import { Fonts, Palette } from "@/constants/Theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ACCENT = Palette.light.accent;

export default function AffirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, saveAppState } = useLocalStorage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyShown, setDailyShown] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMoodVisible, setIsMoodVisible] = useState(false);
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);
  const [pinned, setPinned] = useState<Affirmation | null>(null);
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPracticePopupVisible, setIsPracticePopupVisible] = useState(false);
  const [isPracticeSessionVisible, setIsPracticeSessionVisible] =
    useState(false);
  const [practiceDuration, setPracticeDuration] = useState(5);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });
  const { customBackground } = useBackground();
  const { logActivity } = useStatsStore();
  const { selectedCategory } = useCategoryStore();
  const carouselRef = useRef<ICarouselInstance>(null);
  const isPremium = useIsPremium();
  const { categories } = useCategories();
  const feed = useAffirmationFeed(selectedCategory);
  const favorites = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const voice = useVoiceRecordings(isPremium);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const filteredAffirmations = useMemo(() => {
    if (!pinned) return feed.items;
    return [pinned, ...feed.items.filter((a) => a.id !== pinned.id)];
  }, [feed.items, pinned]);

  useEffect(() => {
    setPinned(null);
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, pinned]);

  const current: Affirmation | undefined = filteredAffirmations[currentIndex];
  const favoriteIds = useMemo(
    () => new Set((favorites.data ?? []).map((f) => f.id)),
    [favorites.data]
  );
  const isLiked = !!current && favoriteIds.has(current.id);
  const recording = useMemo(
    () =>
      current &&
      voice.data?.find(
        (r) =>
          (r.affirmationId && r.affirmationId === current.id) ||
          r.affirmationText === current.text
      ),
    [voice.data, current]
  );

  useEffect(() => {
    player.pause();
  }, [currentIndex, player]);

  const activeCategory = findCategory(selectedCategory, categories);
  const screenWidth = Dimensions.get("window").width;

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

  const handleLikePress = () => {
    if (!current || current.isCustom) return;
    const favorite = !isLiked;
    toggleFavorite.mutate({ affirmation: current, favorite });

    if (favorite) {
      trackActivity("liked");
      logActivity({
        type: "affirmation_liked",
        affirmationId: current.id,
        affirmationText: current.text,
        affirmationCategory: current.category,
      });
    }
  };

  const handleVoicePress = () => {
    if (!isPremium) {
      router.push("/paywall");
      return;
    }
    if (recording) {
      if (playerStatus.playing) {
        player.pause();
      } else {
        player.replace({ uri: recording.url });
        player.play();
      }
      return;
    }
    setIsRecorderVisible(true);
  };

  const handleShufflePress = () => {
    if (filteredAffirmations.length < 2) return;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * filteredAffirmations.length);
    }
    carouselRef.current?.scrollTo({ index: next, animated: true });
  };

  const share = async (kind: "image" | "text") => {
    if (isSharing || !current) return;
    setIsSharing(true);

    try {
      logActivity({
        type: "affirmation_shared",
        affirmationId: current.id,
        affirmationText: current.text,
        affirmationCategory: current.category,
      });
      trackActivity("shared");

      if (kind === "image") await shareAsImage(shareCardRef);
      else await shareAsText(current.text);
    } catch (error: any) {
      console.error("Share error:", error);
      showPopup(
        "Error",
        `Failed to share: ${error?.message || "Unknown error"}`,
        [{ text: "OK", onPress: () => {} }]
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleSharePress = () => {
    showPopup("Share affirmation", "How would you like to share it?", [
      { text: "As image", onPress: () => share("image") },
      { text: "As text", onPress: () => share("text") },
      { text: "Cancel", onPress: () => {}, style: "cancel" },
    ]);
  };

  const handleStartPractice = (duration: number) => {
    setPracticeDuration(duration);
    setIsPracticeSessionVisible(true);
  };

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    setDailyShown((prev) => prev + 1);
    trackActivity("viewed");

    logActivity({
      type: "affirmation_viewed",
      affirmationId: filteredAffirmations[index]?.id?.toString(),
      affirmationText: filteredAffirmations[index]?.text,
      affirmationCategory: filteredAffirmations[index]?.category,
    });

    saveAppState({
      userProfile: userProfile!,
      currentAffirmationIndex: index,
      dailyAffirmationsShown: dailyShown + 1,
      lastAffirmationDate: timeUtils.getCurrentDateString(),
    });
  };

  useEffect(() => {
    trackActivity("viewed");
  }, []);

  const renderCarouselItem = ({ item }: { item: Affirmation }) => {
    const category = findCategory(item.category, categories);
    const label =
      pinned?.id === item.id
        ? "For your mood"
        : item.id === feed.dailyId
          ? "Today's affirmation"
          : null;
    return (
      <View style={styles.slide}>
        {label && <Text style={styles.dailyLabel}>{label}</Text>}
        <LinearGradient
          colors={Palette.light.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Ionicons
            name={(category?.icon as IconName) ?? "heart"}
            size={30}
            color="#FFFFFF"
          />
        </LinearGradient>
        <Text style={styles.quoteText}>{item.text}</Text>
        {category && (
          <Text style={styles.categoryText}>{category.name}</Text>
        )}
      </View>
    );
  };

  if (!userProfile) {
    return <Redirect href="/welcome/quote" />;
  }

  return (
    <>
      <ImageBackground
        source={
          customBackground
            ? { uri: customBackground }
            : require("@/assets/images/home.jpg")
        }
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(22, 16, 48, 0.55)",
            "rgba(40, 28, 90, 0.25)",
            "rgba(22, 16, 48, 0.85)",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/categories")}
            style={styles.categoryPill}
            activeOpacity={0.8}
          >
            <Ionicons
              name={(activeCategory?.icon as IconName) ?? "apps"}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.categoryPillText}>
              {selectedCategory === "all" ? "All" : activeCategory?.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topActions}>
            <IconButton
              icon="happy-outline"
              onPress={() => setIsMoodVisible(true)}
            />
            <IconButton
              icon="stats-chart-outline"
              onPress={() => router.push("/(tabs)/stats")}
            />
            <IconButton
              icon={isSharing ? "hourglass-outline" : "share-outline"}
              onPress={handleSharePress}
            />
          </View>
        </View>

        {/* Affirmations */}
        <View
          style={styles.carouselContainer}
          onLayout={(e) => setCarouselHeight(e.nativeEvent.layout.height)}
        >
          {carouselHeight > 0 && filteredAffirmations.length === 0 && (
            <View style={styles.slide}>
              <Text style={styles.emptyText}>
                {selectedCategory === "custom"
                  ? "You haven't written any affirmations yet."
                  : "Nothing here yet."}
              </Text>
              {selectedCategory === "custom" && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/add")}
                  style={[styles.categoryPill, { marginTop: 18 }]}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.categoryPillText}>Write one</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {carouselHeight > 0 && filteredAffirmations.length > 0 && (
            <Carousel
              key={`${selectedCategory}:${pinned?.id ?? ""}:${feed.dailyId ?? ""}`}
              ref={carouselRef}
              loop
              vertical
              width={screenWidth}
              height={carouselHeight}
              data={filteredAffirmations}
              scrollAnimationDuration={700}
              onSnapToItem={handleIndexChange}
              renderItem={renderCarouselItem}
            />
          )}
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={handleShufflePress}
            style={styles.glassCircle}
            activeOpacity={0.8}
          >
            <Ionicons name="shuffle" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {!current?.isCustom && (
            <TouchableOpacity
              onPress={handleLikePress}
              style={[styles.glassCircle, isLiked && styles.glassCircleActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleVoicePress}
            style={[
              styles.glassCircle,
              playerStatus.playing && styles.glassCircleActive,
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                recording
                  ? playerStatus.playing
                    ? "pause"
                    : "play"
                  : "mic-outline"
              }
              size={22}
              color="#FFFFFF"
            />
            {!isPremium && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={9} color={ACCENT} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom nav */}
        <View
          style={[styles.navWrap, { paddingBottom: insets.bottom + 14 }]}
        >
          <View style={styles.nav}>
            <NavItem
              icon="layers-outline"
              onPress={() => router.push("/(tabs)/categories")}
            />
            <NavItem
              icon="brush-outline"
              onPress={() => router.push("/(tabs)/theme")}
            />
            <View style={styles.navCenterSlot} />
            <NavItem
              icon="bookmark-outline"
              onPress={() => router.push("/(tabs)/favorites")}
            />
            <NavItem
              icon="person-outline"
              onPress={() => router.push("/(tabs)/profile")}
            />
          </View>
          <TouchableOpacity
            onPress={() => setIsPracticePopupVisible(true)}
            style={[styles.navCenter, { bottom: insets.bottom + 14 + 14 }]}
            activeOpacity={0.9}
          >
            <Ionicons name="play" size={26} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />

      <AffirmationsPracticePopup
        visible={isPracticePopupVisible}
        onClose={() => setIsPracticePopupVisible(false)}
        onStartPractice={handleStartPractice}
      />

      <AffirmationsPracticeSession
        visible={isPracticeSessionVisible}
        duration={practiceDuration}
        onClose={() => setIsPracticeSessionVisible(false)}
        onRestart={() => {
          setIsPracticeSessionVisible(false);
          setIsPracticePopupVisible(true);
        }}
      />

      <MoodCheckinSheet
        visible={isMoodVisible}
        onClose={() => setIsMoodVisible(false)}
        onShowAffirmation={setPinned}
      />

      <VoiceRecorderSheet
        visible={isRecorderVisible}
        affirmation={current ?? null}
        onClose={() => setIsRecorderVisible(false)}
      />

      {current && (
        <ShareCard
          ref={shareCardRef}
          text={current.text}
          category={findCategory(current.category, categories)?.name}
        />
      )}
    </>
  );
}

function IconButton({
  icon,
  onPress,
}: {
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} style={styles.iconButton}>
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function NavItem({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={6} style={styles.navItem}>
      <Ionicons name={icon} size={22} color="rgba(255,255,255,0.92)" />
    </TouchableOpacity>
  );
}

const GLASS = "rgba(255, 255, 255, 0.16)";
const GLASS_BORDER = "rgba(255, 255, 255, 0.22)";

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: Fonts.semibold,
  },
  topActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    boxShadow: "0 10px 30px rgba(124, 92, 252, 0.45)",
  },
  quoteText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 42,
    fontFamily: Fonts.bold,
    textAlign: "center",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  dailyLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    fontFamily: Fonts.semibold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 18,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: Fonts.semibold,
    textAlign: "center",
  },
  lockBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    marginTop: 20,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontFamily: Fonts.semibold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 28,
  },
  glassCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  glassCircleActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  navWrap: {
    paddingHorizontal: 20,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 64,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  navItem: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenterSlot: {
    width: 64,
  },
  navCenter: {
    position: "absolute",
    alignSelf: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
  },
});

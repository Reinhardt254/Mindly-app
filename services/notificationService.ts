import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { AFFIRMATIONS } from "@/constants/Affirmations";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSchedule {
  frequency: number; // Number of notifications per day
  startHour: number; // Start hour (0-23)
  endHour: number; // End hour (0-23)
}

class NotificationService {
  private isInitialized = false;

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log("Notifications only work on physical devices");
      return false;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Failed to get notification permissions!");
        return false;
      }

      console.log("✅ Notification permissions granted!");

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("affirmations", {
          name: "Affirmation Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  /**
   * Schedule daily affirmation notifications based on user preferences
   */
  async scheduleAffirmationNotifications(
    schedule: NotificationSchedule
  ): Promise<void> {
    console.log("📅 Starting notification scheduling...");
    console.log(`   Frequency: ${schedule.frequency}x per day`);
    console.log(
      `   Time Range: ${schedule.startHour}:00 - ${schedule.endHour}:00`
    );

    try {
      // Cancel all existing notifications first
      await this.cancelAllNotifications();

      if (!this.isInitialized) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          throw new Error("Notification permissions not granted");
        }
      }

      const { frequency, startHour, endHour } = schedule;

      // Calculate time interval between notifications
      const totalHours = endHour - startHour;
      const intervalHours = totalHours / frequency;

      // Get random affirmations for variety
      const selectedAffirmations = this.getRandomAffirmations(frequency * 7); // 7 days worth

      // Schedule notifications
      let affirmationIndex = 0;

      for (let day = 0; day < 7; day++) {
        for (let i = 0; i < frequency; i++) {
          const hour = Math.floor(startHour + i * intervalHours);
          const minute = Math.floor(Math.random() * 60); // Random minute for variety

          const affirmation =
            selectedAffirmations[
              affirmationIndex % selectedAffirmations.length
            ];
          affirmationIndex++;

          const trigger: Notifications.CalendarTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
          };

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "✨ Your Daily Affirmation",
              body: affirmation.text,
              sound: "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
              categoryIdentifier: "affirmation",
              data: {
                affirmationId: affirmation.id,
                category: affirmation.category,
                type: "daily_affirmation",
              },
            },
            trigger,
          });

          console.log(
            `Scheduled notification for ${hour}:${minute.toString().padStart(2, "0")} - "${affirmation.text.substring(0, 30)}..."`
          );
        }
      }

      const totalScheduled = await this.getScheduledNotifications();
      console.log("\n✅ NOTIFICATION SCHEDULING COMPLETE!");
      console.log(
        `   📊 Total notifications scheduled: ${totalScheduled.length}`
      );
      console.log(`   🔔 ${frequency} notifications per day`);
      console.log(`   ⏰ Between ${startHour}:00 and ${endHour}:00`);
      console.log(`   📅 Next 7 days scheduled with different affirmations\n`);
    } catch (error) {
      console.error("Error scheduling affirmation notifications:", error);
      throw error;
    }
  }

  /**
   * Get random affirmations for notifications
   */
  private getRandomAffirmations(count: number): typeof AFFIRMATIONS {
    const shuffled = [...AFFIRMATIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, AFFIRMATIONS.length));
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      const before = await Notifications.getAllScheduledNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(`🗑️  Cancelled ${before.length} scheduled notifications`);
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Send immediate test notification
   */
  async sendTestNotification(): Promise<void> {
    try {
      const randomAffirmation =
        AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✨ Test Affirmation",
          body: randomAffirmation.text,
          sound: "default",
          data: {
            affirmationId: randomAffirmation.id,
            category: randomAffirmation.category,
            type: "test",
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      console.log(
        "🧪 Test notification scheduled - should appear in ~2 seconds"
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();

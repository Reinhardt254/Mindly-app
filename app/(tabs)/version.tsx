import React from "react";
import { PolicyPage } from "@/components/PolicyPage";

export default function VersionScreen() {
  const versionContent = `App Version Information

Current Version: 1.0.0
Release Date: ${new Date().toLocaleDateString()}

What's New in Version 1.0.0:
• Initial release of Mood Affirmation App
• Daily affirmations with beautiful carousel interface
• Personalized user profiles and preferences
• Progress tracking and statistics
• Dark/Light mode support
• Gradient backgrounds and modern UI design
• Bottom navigation with multiple sections

Features:
• Infinite horizontal swipe for affirmations
• Customizable affirmation frequency
• User profile management
• Settings and preferences
• Progress tracking and achievements
• Privacy-focused local data storage

Technical Information:
• Built with React Native and Expo
• Uses NativeWind for styling
• Implements react-native-reanimated-carousel
• Local storage with AsyncStorage
• Responsive design for all screen sizes

System Requirements:
• iOS 12.0 or later
• Android 6.0 (API level 23) or later
• Internet connection for initial setup

Support:
For technical support or feature requests, please contact us at support@moodaffirmation.com

Thank you for using our Mood Affirmation App!`;

  return (
    <PolicyPage
      title="Version Information"
      content={versionContent}
      showBackButton={true}
    />
  );
}

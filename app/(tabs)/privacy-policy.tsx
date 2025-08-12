import React from "react";
import { PolicyPage } from "@/components/PolicyPage";

export default function PrivacyPolicyScreen() {
  const privacyContent = `Privacy Policy

Welcome to our Mood Affirmation App. We respect your privacy and are committed to protecting your personal information.

Information We Collect:
• Personal information (name, email, age range, gender)
• App usage data and preferences
• Device information for app functionality

How We Use Your Information:
• To provide personalized affirmations
• To improve app functionality and user experience
• To send notifications (with your consent)
• To track your progress and achievements

Data Storage:
• Your data is stored locally on your device
• We do not share your personal information with third parties
• You can delete your data at any time through the app settings

Your Rights:
• Access your personal data
• Request deletion of your data
• Opt-out of notifications
• Control your privacy settings

Contact Us:
If you have any questions about this Privacy Policy, please contact us at support@moodaffirmation.com

This privacy policy is effective as of the date shown above and will remain in effect except with respect to any changes in its provisions in the future.`;

  return <PolicyPage title="Privacy Policy" content={privacyContent} />;
}

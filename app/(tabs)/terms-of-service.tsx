import React from "react";
import { PolicyPage } from "@/components/PolicyPage";

export default function TermsOfServiceScreen() {
  const termsContent = `Terms of Service

Welcome to our Mood Affirmation App. By using this app, you agree to these terms and conditions.

Acceptance of Terms:
By downloading, installing, or using this app, you accept and agree to be bound by these Terms of Service.

Use of the App:
• You must be at least 13 years old to use this app
• You agree to use the app for personal, non-commercial purposes only
• You will not attempt to reverse engineer or modify the app
• You will not use the app for any illegal or harmful purposes

User Content:
• You are responsible for any content you create or share
• We do not claim ownership of your personal data
• You retain all rights to your personal information

Intellectual Property:
• The app and its content are protected by copyright and other laws
• You may not copy, distribute, or create derivative works
• All affirmations and content are provided for personal use only

Limitation of Liability:
• The app is provided "as is" without warranties
• We are not liable for any damages arising from app use
• We do not guarantee the accuracy of affirmations or advice

Termination:
• We may terminate or suspend access to the app at any time
• You may stop using the app at any time
• Upon termination, your data will be deleted from our servers

Changes to Terms:
We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of new terms.

Contact Information:
For questions about these Terms of Service, contact us at legal@moodaffirmation.com

These terms are effective as of the date shown above.`;

  return <PolicyPage title="Terms of Service" content={termsContent} />;
}

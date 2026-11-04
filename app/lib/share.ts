import type { RefObject } from "react";
import { Share, View } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { APP_NAME, PLAY_STORE_URL } from "./config";

export async function shareAsText(text: string) {
  await Share.share({
    message: `“${text}”\n\nDaily affirmations to transform your mindset. Get ${APP_NAME}:\n${PLAY_STORE_URL}`,
    title: `${APP_NAME} - Daily Affirmation`,
  });
}

export async function shareAsImage(cardRef: RefObject<View | null>) {
  if (!cardRef.current) throw new Error("Nothing to capture");
  const uri = await captureRef(cardRef, { format: "png", quality: 1, width: 1080, height: 1350, result: "tmpfile" });
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device");
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: `Share from ${APP_NAME}`, UTI: "public.png" });
}

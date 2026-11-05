import * as ImagePicker from "expo-image-picker";
import { api } from "./api";

const TYPES = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
} as const;

/** Lets an admin choose a photo and stores it. Returns null when they cancel. */
export async function pickContentImage(): Promise<{ key: string; previewUri: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Photo access is needed to choose an image.");

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const contentType = TYPES[(asset.mimeType ?? "image/jpeg") as keyof typeof TYPES];
  if (!contentType) throw new Error("Use a JPEG, PNG, or WebP image.");

  const { key, uploadUrl } = await api<{ key: string; uploadUrl: string }>("/admin/uploads", {
    method: "POST",
    body: { contentType },
  });
  const blob = await (await fetch(asset.uri)).blob();
  const uploaded = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
  if (!uploaded.ok) throw new Error(`Upload failed (${uploaded.status})`);
  return { key, previewUri: asset.uri };
}

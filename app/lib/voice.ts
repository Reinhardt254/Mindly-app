import { api } from "./api";
import type { VoiceRecording } from "@/hooks/useApi";

const MIME_TYPE = "audio/mp4";

/** Uploads a local .m4a recording to storage via a presigned URL and saves its metadata. */
export async function uploadVoiceRecording(params: {
  uri: string;
  durationMs: number;
  affirmationId?: string;
  affirmationText?: string;
}): Promise<VoiceRecording> {
  const { objectKey, uploadUrl } = await api<{ objectKey: string; uploadUrl: string }>("/voice/upload-url", {
    method: "POST",
    body: { mimeType: MIME_TYPE },
  });

  const blob = await (await fetch(params.uri)).blob();
  const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": MIME_TYPE }, body: blob });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);

  return api<VoiceRecording>("/voice", {
    method: "POST",
    body: {
      objectKey,
      mimeType: MIME_TYPE,
      durationMs: Math.round(params.durationMs),
      affirmationId: params.affirmationId?.startsWith("custom:") ? undefined : params.affirmationId,
      affirmationText: params.affirmationText,
    },
  });
}

import { api } from "@/lib/axios";

const extractMediaUrl = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;

  const source = payload as Record<string, unknown>;

  const candidates = [
    source.media_url,
    source.mediaUrl,
    source.url,
    source.path,
    source.location,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  if (source.data && typeof source.data === "object") {
    return extractMediaUrl(source.data);
  }

  return null;
};

export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/v1/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });

  const mediaUrl = extractMediaUrl(res.data);

  if (!mediaUrl) {
    throw new Error("Media upload succeeded but URL was not returned");
  }

  return mediaUrl;
};

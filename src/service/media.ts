import { api } from "@/lib/axios";

//////////////////////////////////////////////////////////////
// 🔥 HELPER: EXTRACT MEDIA URL (ROBUST)
//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////
// 🔥 SECURITY HELPERS
//////////////////////////////////////////////////////////////

const getSecurityHeaders = () => ({
  "X-Timestamp": Date.now().toString(),
  // 🔥 PERBAIKAN: Wajib tambahkan Request-ID untuk Next.js dan Redis Go
  "X-Request-ID": crypto.randomUUID(),
});

const getCSRFToken = () => {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

//////////////////////////////////////////////////////////////
// 🔥 MAIN UPLOAD FUNCTION
//////////////////////////////////////////////////////////////

export const uploadMedia = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("File is required");
  }

  ////////////////////////////////////////////////////////////
  // 🔥 VALIDATION (OPTIONAL BUT RECOMMENDED)
  ////////////////////////////////////////////////////////////

  // max 5MB
  const MAX_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  // hanya image
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  ////////////////////////////////////////////////////////////
  // 🔥 FORM DATA
  ////////////////////////////////////////////////////////////

  const formData = new FormData();
  formData.append("file", file);

  ////////////////////////////////////////////////////////////
  // 🔥 REQUEST
  ////////////////////////////////////////////////////////////

  const res = await api.post("/v1/media/upload", formData, {
    withCredentials: true,

    // ❗ JANGAN set Content-Type manual (biar axios handle boundary)
    headers: {
      ...getSecurityHeaders(),
      ...(getCSRFToken() ? { "X-CSRF-Token": getCSRFToken() } : {}),
    },
  });

  ////////////////////////////////////////////////////////////
  // 🔥 RESPONSE PARSING
  ////////////////////////////////////////////////////////////

  const mediaUrl = extractMediaUrl(res.data);

  if (!mediaUrl) {
    console.error("Upload response:", res.data);
    throw new Error("Media upload succeeded but URL was not returned");
  }

  return mediaUrl;
};

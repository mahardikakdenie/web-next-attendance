// src/services/auth.service.ts
import { api } from "@/lib/axios";

export const getDataAttendances = async () => {
  const res = await api.get("/v1/attendance", {
    withCredentials: true,
  });
  return res.data;
};

export const recordAttendances = async (payload: {
    action: string;
    latitude: string;
    longitude: string;
    media_url: string;
}) => {
    const res = await api.post('/v1/attendance',  payload, {
        withCredentials: true,
    });

    return res.data;
};

import { api } from "@/lib/axios";

export type RecordAttendancePayload = {
  action: string;
  latitude: number;
  longitude: number;
  media_url: string;
};

export const getDataAttendances = async () => {
  const res = await api.get("/v1/attendance", {
    withCredentials: true,
  });

  return res.data;
};

export const recordAttendances = async (payload: RecordAttendancePayload) => {
  const res = await api.post("/v1/attendance", payload, {
    withCredentials: true,
  });

  return res.data;
};

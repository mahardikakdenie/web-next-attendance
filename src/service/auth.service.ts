import { api } from "@/lib/axios";

export const login = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    return Promise.reject(error);
  }
);

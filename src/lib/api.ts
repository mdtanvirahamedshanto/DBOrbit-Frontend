import axios from "axios";
import { toast } from "sonner";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "The request could not be completed.";

    if (typeof window !== "undefined") {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

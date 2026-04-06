import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success?: false;
  error?: {
    code?: string;
    message?: string | string[];
  };
  message?: string | string[];
}

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "http://localhost:4000",
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json"
  }
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    const candidate =
      response?.error?.message ?? response?.message ?? error.message ?? "Request failed";

    if (Array.isArray(candidate)) {
      return candidate.join(", ");
    }

    return candidate;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The request could not be completed.";
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (typeof window !== "undefined") {
      toast.error(getApiErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

export async function unwrapResponse<T>(promise: Promise<{ data: ApiSuccessResponse<T> }>) {
  const { data } = await promise;
  return data.data;
}

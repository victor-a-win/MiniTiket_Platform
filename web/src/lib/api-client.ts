import axios from "axios";
import { API_BASE_URL } from "./config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error("API endpoint not found:", error.config.url);
    } else if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as {
      error?: string;
      message?: string;
    };

    return (
      responseData?.error ||
      responseData?.message ||
      error.response?.statusText ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

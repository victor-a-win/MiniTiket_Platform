"use client";

import { apiClient, extractApiError } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "CUSTOMER";
  pointsBalance?: number;
  organizer?: {
    displayName: string;
    bio: string | null;
    ratingsAvg: number;
  } | null;
}

interface AuthResponse {
  message: string;
  data: AuthUser & { token: string };
}

interface ProfileResponse {
  data: AuthUser;
}

export async function loginRequest(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ORGANIZER";
}): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function getProfileRequest(
  token: string
): Promise<ProfileResponse> {
  try {
    const response = await apiClient.get<ProfileResponse>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

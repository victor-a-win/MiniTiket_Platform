"use client";

import { apiClient, extractApiError } from "./api-client";

export interface OrganizerProfileResponse {
  data: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "ORGANIZER" | "CUSTOMER";
    pointsBalance: number;
    organizer: {
      displayName: string;
      bio: string | null;
      ratingsAvg: number;
    } | null;
  };
}

export interface UpdateOrganizerProfilePayload {
  displayName: string;
  bio?: string;
}

export interface PublicOrganizerProfile {
  id: string;
  displayName: string;
  bio: string | null;
  ratingsAvg: number;
  ratingsCount: number;
  user: {
    name: string;
    email: string;
  };
  events: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    location: string;
    startAt: string;
    endAt: string;
    isPaid: boolean;
    capacity: number;
    seatsAvailable: number;
    ticketTypes: {
      id: string;
      name: string;
      priceIDR: number;
      quota: number | null;
    }[];
    promotions: {
      id: string;
      code: string;
      type: "PERCENT" | "FLAT" | string;
      value: number;
      minSpendIDR: number;
      startsAt: string;
      endsAt: string;
      maxUses: number | null;
      usedCount: number;
    }[];
    reviews: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      user: { name: string };
    }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string };
    event: {
      title: string;
      startAt: string;
      location: string;
    };
  }[];
}

export async function fetchOrganizerProfile(
  token: string
): Promise<OrganizerProfileResponse> {
  try {
    const response = await apiClient.get<OrganizerProfileResponse>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function updateOrganizerProfile(
  payload: UpdateOrganizerProfilePayload,
  token: string
) {
  try {
    const response = await apiClient.put("/auth/organizer", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchPublicOrganizerProfile(organizerId: string) {
  try {
    const response = await apiClient.get<PublicOrganizerProfile>(
      `/events/organizers/${organizerId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

import { apiClient, extractApiError } from "./api-client";

export interface PromotionPayload {
  eventId: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minSpendIDR: number;
  startsAt: string;
  endsAt: string;
  maxUses?: number;
}

export interface OrganizerPromotion {
  id: string;
  eventId: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minSpendIDR: number;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
  event?: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
  };
}

export async function createPromotion(
  payload: PromotionPayload,
  token: string
) {
  try {
    const response = await apiClient.post("/promotions", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function updatePromotion(
  id: string,
  payload: Partial<Omit<PromotionPayload, "eventId">>,
  token: string
) {
  try {
    const response = await apiClient.put(`/promotions/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function deletePromotion(id: string, token: string) {
  try {
    const response = await apiClient.delete(`/promotions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchOrganizerPromotions(token: string) {
  try {
    const response = await apiClient.get<{ data: OrganizerPromotion[] }>(
      "/promotions/mine",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

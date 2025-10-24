import { apiClient, extractApiError } from "./api-client";

export interface SubmitReviewPayload {
  eventId: string;
  rating: number;
  comment?: string;
}

export async function submitEventReview(
  payload: SubmitReviewPayload,
  token: string
) {
  try {
    const response = await apiClient.post("/reviews", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

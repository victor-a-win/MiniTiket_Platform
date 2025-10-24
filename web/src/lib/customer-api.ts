"use client";

import { apiClient, extractApiError } from "./api-client";

interface TransactionListResponse {
  data: Array<{
    id: string;
    eventId: string;
    status: string;
    totalBeforeIDR: number;
    pointsUsedIDR: number;
    promoCode?: string | null;
    promoDiscountIDR: number;
    totalPayableIDR: number;
    expiresAt: string;
    createdAt: string;
    paymentProofUrl?: string | null;
    decisionDueAt?: string | null;
    event: {
      title: string;
      location: string;
      startAt: string;
      endAt: string;
    };
    items: Array<{
      id: string;
      qty: number;
      unitPriceIDR: number;
      lineTotalIDR: number;
      ticketType?: { name: string; priceIDR: number } | null;
    }>;
  }>;
}

export interface UpdateCustomerProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}

export type CustomerTransaction = TransactionListResponse["data"][number];

export async function updateCustomerProfile(
  payload: UpdateCustomerProfilePayload,
  token: string
) {
  try {
    const response = await apiClient.put("/auth/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchCustomerTransactions(token: string) {
  try {
    const response = await apiClient.get<TransactionListResponse>(
      "/transactions",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

"use client";

import { apiClient, extractApiError } from "./api-client";

export interface TransactionItem {
  id: string;
  ticketTypeId: string | null;
  qty: number;
  unitPriceIDR: number;
  lineTotalIDR: number;
  ticketType?: {
    name: string;
    priceIDR: number;
  } | null;
}

export interface TransactionEventSummary {
  title: string;
  location: string;
  startAt?: string;
  endAt?: string;
}

export interface TransactionResponse {
  message: string;
  data: {
    id: string;
    status:
      | "WAITING_PAYMENT"
      | "WAITING_CONFIRMATION"
      | "DONE"
      | "REJECTED"
      | "EXPIRED"
      | "CANCELED";
    eventId: string;
    totalBeforeIDR: number;
    pointsUsedIDR: number;
    promoCode?: string | null;
    promoDiscountIDR: number;
    totalPayableIDR: number;
    expiresAt: string;
    createdAt: string;
    event: TransactionEventSummary;
    items: TransactionItem[];
  };
}

export interface ManagedTransaction {
  id: string;
  status:
    | "WAITING_PAYMENT"
    | "WAITING_CONFIRMATION"
    | "DONE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELED";
  totalBeforeIDR: number;
  pointsUsedIDR: number;
  promoCode?: string | null;
  promoDiscountIDR: number;
  totalPayableIDR: number;
  expiresAt: string;
  decisionDueAt?: string | null;
  createdAt: string;
  paymentProofUrl?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
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
    ticketType?: {
      name: string;
      priceIDR: number;
    } | null;
  }>;
}

export interface CreateTransactionPayload {
  eventId: string;
  ticketTypeId: string;
  qty: number;
  usePoints?: boolean;
  promoCode?: string;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
  token: string
): Promise<TransactionResponse> {
  try {
    const response = await apiClient.post<TransactionResponse>(
      "/transactions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchManagedTransactions(
  token: string,
  params?: { status?: string }
) {
  try {
    const response = await apiClient.get<{ data: ManagedTransaction[] }>(
      "/transactions/manage",
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function updateTransactionStatus(
  id: string,
  status: ManagedTransaction["status"],
  token: string
) {
  try {
    const response = await apiClient.put(
      `/transactions/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function uploadPaymentProof(
  transactionId: string,
  file: File,
  token: string
) {
  try {
    const formData = new FormData();
    formData.append("paymentProof", file);

    const response = await apiClient.post(
      `/transactions/${transactionId}/proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

import { Event } from "./event.interface";

export type TransactionStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export interface TransactionPayload {
  quantity: number;
  usePoints: boolean;
  voucherCode?: string;
  promoCode?: string;
}

export interface Transaction {
  id: string;
  status: string;
  quantity: number;
  total_amount: number;
  totalPayableIDR?: number;
  created_at: string;
  payment_proof: string | null;
  paymentProofUrl?: string | null;
  payment_method: string;
  event_id: string;
  event: Event;
  user_id: number;
  user: { first_name: string; last_name: string; email: string };
  payment_date?: string;
  expired_at?: string;
  expiresAt?: string;
  promoCode?: string;
  pointsUsedIDR?: number;
  promoDiscountIDR?: number;
  decisionDueAt?: string | null;
  items?: any[];
}

export interface CustomerTransaction extends Transaction {}

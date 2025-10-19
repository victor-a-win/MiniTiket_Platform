import { Event } from "./event.interface";

export type TransactionStatus =
  | 'waiting_for_payment'
  | 'waiting_for_admin'
  | 'confirmation'
  | 'done'
  | 'rejected'
  | 'expired'
  | 'canceled';

export interface TransactionPayload {
  quantity: number;
  usePoints: boolean;
  voucherCode?: string;
  couponCode?: string;
}

export interface Transaction {
  id: string;
  status: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  payment_proof: string | null;
  payment_method: string;
  event_id: string;
  event: { name: string };
  user_id: number;
  user: { first_name: string; last_name: string; email: string };
  payment_date?: string;
  expired_at?: string;
}


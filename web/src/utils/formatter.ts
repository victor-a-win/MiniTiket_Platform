"use client";

import type { EventSummary } from "@/lib/events-api";

/**
 * Menghitung waktu mundur (countdown) dari tanggal ISO.
 * Contoh hasil: "2j 15m", "45m 30s", atau "Kadaluarsa"
 */
export function formatCountdown(iso?: string | null): string {
  if (!iso) return "-";

  const targetTime = new Date(iso).getTime();
  if (Number.isNaN(targetTime)) return "-";

  const remainingMs = targetTime - Date.now();
  if (remainingMs <= 0) return "Kadaluarsa";

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}j ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Mengembalikan warna teks berdasarkan status transaksi.
 */
export function statusColor(status: string): string {
  const colorMap: Record<string, string> = {
    DONE: "text-green-300",
    WAITING_PAYMENT: "text-yellow-300",
    WAITING_CONFIRMATION: "text-yellow-300",
    REJECTED: "text-red-300",
    CANCELED: "text-red-300",
    EXPIRED: "text-red-300",
  };

  return colorMap[status] ?? "text-gray-300";
}

/**
 * Format angka menjadi mata uang Rupiah (IDR)
 * Contoh: 15000 → "Rp 15.000"
 */
export function formatCurrencyIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export const formatDateRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (sameDay) {
    return dateFormatter.format(start);
  }

  return `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`;
};

/**
 * Format harga event
 */
export const computePriceLabel = (event: EventSummary) => {
  if (!event.ticketTypes.length) {
    return event.isPaid ? "Harga belum tersedia" : "Gratis";
  }

  const prices = event.ticketTypes
    .map((ticket) => ticket.priceIDR)
    .filter((price) => typeof price === "number")
    .sort((a, b) => a - b);

  if (!prices.length || prices[0] === 0) {
    return "Gratis";
  }

  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];

  return minPrice === maxPrice
    ? formatCurrencyIDR(minPrice)
    : `${formatCurrencyIDR(minPrice)} – ${formatCurrencyIDR(maxPrice)}`;
};

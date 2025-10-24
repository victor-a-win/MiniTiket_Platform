"use client";

import { useState } from "react";
import {
  Card,
  Label,
  TextInput,
  Button,
  Badge,
  Checkbox,
  Tooltip,
} from "flowbite-react";
import { Ticket, Crown } from "lucide-react";
import { EventDetail } from "@/lib/events-api";
import { formatCurrencyIDR } from "@/utils/formatter";

export function TicketSelector({
  event,
  selectedTicket,
  setSelectedTicket,
  qty,
  setQty,
  onCheckout,
  userPointsBalance = 0,
  usePoints,
  setUsePoints,
  promoCode,
  setPromoCode,
}: {
  event: EventDetail;
  selectedTicket: string;
  setSelectedTicket: (v: string) => void;
  qty: number;
  setQty: (n: number) => void;
  onCheckout: () => void;
  userPointsBalance?: number;
  usePoints: boolean;
  setUsePoints: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
}) {
  const [showSummary, setShowSummary] = useState(false);

  // Hitung Total Harga
  const selected = event.ticketTypes.find((t) => t.id === selectedTicket);
  const subtotal = selected ? selected.priceIDR * qty : 0;

  // Promo & poin belum dihitung di client — hanya tampilan estimasi.
  const estimatedTotal = usePoints
    ? Math.max(subtotal - userPointsBalance, 0)
    : subtotal;

  return (
    <Card className="border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 p-3 md:p-5 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Ticket size={18} className="text-indigo-400" /> Pilih Tiket
        </h2>
        <Button
          color="light"
          size="xs"
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? "Sembunyikan Rincian" : "Lihat Rincian"}
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {event.ticketTypes.map((ticket) => {
          const isSelected = selectedTicket === ticket.id;
          const isFree = ticket.priceIDR === 0;
          const isLimited = ticket.quota && ticket.quota < 50;
          const isVIP = ticket.name.toLowerCase().includes("vip");

          return (
            <Card
              key={ticket.id}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-800/30 to-purple-900/30 "
                  : "border-gray-700 bg-gray-900/60 hover:border-indigo-400"
              }`}
              onClick={() => setSelectedTicket(ticket.id)}
            >
              <div className="absolute top-3 right-3 flex gap-2">
                {isFree && <Badge color="success">Gratis</Badge>}
                {isLimited && <Badge color="failure">Terbatas</Badge>}
                {isVIP && <Badge color="yellow">VIP</Badge>}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {ticket.name}
              </h3>
              <p
                className={`text-sm font-medium ${
                  isFree ? "text-green-400" : "text-indigo-300"
                }`}
              >
                {isFree ? "Gratis" : formatCurrencyIDR(ticket.priceIDR)}
              </p>
              {ticket.quota && (
                <p className="text-xs text-gray-400 mt-1">
                  Kuota tersisa:{" "}
                  <span className="text-gray-200 font-medium">
                    {ticket.quota}
                  </span>
                </p>
              )}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl border border-indigo-400/50 ring-1 ring-indigo-500/20 pointer-events-none" />
              )}
            </Card>
          );
        })}
      </div>
      {selectedTicket && (
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Label htmlFor="qty" className="block">
            Jumlah Tiket
          </Label>
          <TextInput
            id="qty"
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>
      )}
      {selectedTicket && (
        <div className="space-y-4 mt-4 border-t border-gray-800 pt-4">
          <div>
            <Label htmlFor="promoCode" className="block mb-2">
              Kode Promo (opsional)
            </Label>
            <TextInput
              id="promoCode"
              placeholder="Masukkan kode promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="usePoints"
              checked={usePoints}
              onChange={(e) => setUsePoints(e.target.checked)}
            />
            <Label
              htmlFor="usePoints"
              className="text-gray-300 flex items-center gap-2"
            >
              Gunakan poin tersedia{" "}
              <span className="text-amber-400 font-semibold">
                {formatCurrencyIDR(userPointsBalance)}
              </span>
            </Label>
          </div>
        </div>
      )}
      {selectedTicket && showSummary && (
        <div className="bg-gray-800/60 rounded-lg p-4 mt-4 text-sm space-y-1 border border-gray-700">
          <p className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-indigo-300">
              {formatCurrencyIDR(subtotal)}
            </span>
          </p>
          {usePoints && userPointsBalance > 0 && (
            <p className="flex justify-between text-amber-400">
              <span>Poin digunakan</span>
              <span>
                -{formatCurrencyIDR(Math.min(userPointsBalance, subtotal))}
              </span>
            </p>
          )}
          <hr className="border-gray-700 my-2" />
          <p className="flex justify-between font-semibold text-white">
            <span>Total Bayar</span>
            <span>
              {estimatedTotal === 0
                ? "Gratis"
                : formatCurrencyIDR(estimatedTotal)}
            </span>
          </p>
        </div>
      )}
      <div className="pt-5 flex justify-end">
        <Button color="purple" onClick={onCheckout} disabled={!selectedTicket}>
          {selectedTicket ? "Lanjut ke Checkout" : "Pilih Tiket Dulu"}
        </Button>
      </div>
    </Card>
  );
}

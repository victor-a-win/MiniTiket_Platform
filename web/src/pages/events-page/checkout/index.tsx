"use client";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import CheckoutForm from "@/components/transactions/CheckoutForm";
import { Event } from "@/interfaces/event.interface";
import { TransactionPayload } from "@/interfaces/transaction.interface";

export default function EventCheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/events/${id}`)
        .then(res => res.json())
        .then(setEvent);
    }
  }, [id]);

  const handleSubmit = async (payload: TransactionPayload) => {
    const { quantity, usePoints, voucherCode, couponCode } = payload;
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: id,
        user_id: 1, // Ganti dengan user login
        quantity,
        usePoints,
        voucherCode,
        couponCode
      })
    });
    const data = await res.json();
    if (data.payment_url) {
      window.location.href = data.payment_url;
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 flex items-center justify-center">
      <CheckoutForm event={event} onSubmit={handleSubmit} />
    </div>
  );
}

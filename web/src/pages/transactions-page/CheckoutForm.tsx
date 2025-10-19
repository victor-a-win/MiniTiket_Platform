"use client";

import { useState } from "react";

export default function CheckoutForm({ eventId }: { eventId: number }) {
  const [quantity, setQuantity] = useState(1);

  const handleCheckout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, user_id: 1, quantity }),
    });
    alert("Berhasil mendaftar!");
  };

  return (
    <div className="space-y-4">
      <label className="block">
        Jumlah Tiket:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border px-2 py-1 rounded w-full"
          min={1}
        />
      </label>
      <button onClick={handleCheckout} className="bg-green-600 text-white px-4 py-2 rounded">
        Daftar Sekarang
      </button>
    </div>
  );
}

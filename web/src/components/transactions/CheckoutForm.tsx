import { useState } from 'react';
import { Event } from '@/interfaces/event.interface';
import { TransactionPayload } from '@/interfaces/transaction.interface';

type CheckoutFormProps = {
  event: Event;
  onSubmit: (payload: TransactionPayload) => void;
};

export default function CheckoutForm({ event, onSubmit }: CheckoutFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [usePoints, setUsePoints] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [couponCode, setCouponCode] = useState('');

  return (
    <form
      className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mt-8 space-y-6"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ quantity, usePoints, voucherCode, couponCode });
      }}
    >
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">Checkout Tiket</h2>
      <div>
        <label htmlFor="quantity" className="block font-medium text-gray-700 mb-1">Jumlah Tiket</label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={event.seats}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="voucher" className="block font-medium text-gray-700 mb-1">Voucher (Opsional)</label>
        <input
          id="voucher"
          type="text"
          value={voucherCode}
          onChange={e => setVoucherCode(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="coupon" className="block font-medium text-gray-700 mb-1">Coupon (Opsional)</label>
        <input
          id="coupon"
          type="text"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex items-center">
        <input
          id="usePoints"
          type="checkbox"
          checked={usePoints}
          onChange={e => setUsePoints(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="usePoints" className="text-gray-700">Gunakan Poin (jika tersedia)</label>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white font-bold py-2 rounded transition"
      >
        Bayar Sekarang
      </button>
    </form>
  );
}

import { Transaction } from "@/interfaces/transaction.interface";
import PaymentStatusBadge from "@/components/transactions/PaymentStatusBadge";

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const event = transaction.event;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition hover:shadow-xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <div className="font-bold text-lg text-indigo-700">{event?.name ?? "-"}</div>
          <div className="text-gray-500 text-sm">
            {transaction.event?.location ?? "-"} | {event?.category ?? "-"}
          </div>
          <div className="text-gray-600 mt-1">
            Jumlah Tiket: <span className="font-semibold">{transaction.quantity}</span>
          </div>
          <div className="text-gray-600">
            Total: <span className="font-semibold">Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <PaymentStatusBadge status={transaction.status} />
          <div className="text-gray-400 text-xs mt-2">
            {new Date(transaction.created_at).toLocaleString("id-ID")}
          </div>
          {transaction.status === "waiting_for_payment" && transaction.doku_payment_url && (
            <a
              href={transaction.doku_payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 rounded font-semibold transition hover:from-indigo-700 hover:to-pink-600"
            >
              Bayar Sekarang
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/interfaces/transaction.interface";
import TransactionCard from "@/components/transactions/TransactionCard";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions?user_id=1`)
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">🧾 Riwayat Transaksi</h1>
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}

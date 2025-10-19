"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Transaction } from '@/interfaces/transaction.interface';

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/transactions/organizer`,
        { withCredentials: true }
      );
      
      if (response.status !== 200) throw new Error('Failed to fetch transactions');
      setTransactions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (transactionId: string, status: 'done' | 'rejected') => {
    try {
      const reason = status === 'rejected' 
      ? prompt("Please enter the reason for rejection:") 
      : undefined;

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/transactions/${transactionId}/status`,
        { status },
        { withCredentials: true }
      );
      if (response.status !== 200) throw new Error('Failed to update status');
      await fetchTransactions(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Transaction Management</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <div className="text-center py-4">Loading transactions...</div>
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Proof</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4">{transaction.event.name}</td>
                  <td className="px-6 py-4">
                    {transaction.user.first_name} {transaction.user.last_name}
                    <br />
                    <span className="text-sm text-gray-500">{transaction.user.email}</span>
                  </td>
                  <td className="px-6 py-4">{transaction.quantity}</td>
                  <td className="px-6 py-4">${transaction.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded ${
                      transaction.status === 'done' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.payment_proof ? (
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:underline"
                      >
                        View Proof
                      </button>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {transaction.status === 'waiting_for_admin' && (
                      <>
                        <button
                          onClick={() => updateStatus(transaction.id, 'done')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(transaction.id, 'rejected')}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No transactions found.</p>
      )}

      {/* Payment Proof Modal */}
      {selectedTransaction?.payment_proof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Payment Proof</h3>
            <Image
              src={selectedTransaction.payment_proof}
              alt="Payment proof"
              width={800}
              height={600}
              className="rounded-md"
            />
            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
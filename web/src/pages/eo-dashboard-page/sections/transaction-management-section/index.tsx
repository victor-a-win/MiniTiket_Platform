"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'DONE' | 'REJECTED' | 'EXPIRED' | 'CANCELED';
  totalPayableIDR: number;
  paymentProofUrl: string | null;
  paymentProofAt: string | null;
  createdAt: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  event: {
    title: string;
    location: string;
    startAt: string;
    endAt: string;
  };
  items: Array<{
    qty: number;
    ticketType?: {
      name: string;
    };
  }>;
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/transactions/organizer`,
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true 
        }
      );
      
      if (response.data && response.data.data) {
        setTransactions(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (transactionId: string, status: 'DONE' | 'REJECTED') => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/transactions/${transactionId}/status`,
        { status },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true 
        }
      );
      
      if (response.status !== 200) throw new Error('Failed to update status');
      await fetchTransactions(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const getTotalQuantity = (items: Transaction['items']) => {
    return items.reduce((total, item) => total + item.qty, 0);
  };

  const getTicketNames = (items: Transaction['items']) => {
    return items.map(item => item.ticketType?.name || 'General Ticket').join(', ');
  };

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
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{transaction.event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.event.startAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.user.first_name} {transaction.user.last_name}
                    <br />
                    <span className="text-sm text-gray-500">{transaction.user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p>{getTotalQuantity(transaction.items)} tickets</p>
                      <p className="text-sm text-gray-500">{getTicketNames(transaction.items)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    Rp {transaction.totalPayableIDR.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded ${
                      transaction.status === 'DONE' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      transaction.status === 'WAITING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'WAITING_PAYMENT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.paymentProofUrl ? (
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:underline"
                      >
                        View Proof
                      </button>
                    ) : transaction.status === 'WAITING_PAYMENT' ? (
                      <span className="text-gray-500">Waiting for payment</span>
                    ) : (
                      <span className="text-gray-500">No proof</span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {transaction.status === 'WAITING_CONFIRMATION' && (
                      <>
                        <button
                          onClick={() => updateStatus(transaction.id, 'DONE')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(transaction.id, 'REJECTED')}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {transaction.status === 'WAITING_PAYMENT' && (
                      <span className="text-gray-500">Waiting for payment proof</span>
                    )}
                    {transaction.status === 'DONE' && (
                      <span className="text-green-600">Approved</span>
                    )}
                    {transaction.status === 'REJECTED' && (
                      <span className="text-red-600">Rejected</span>
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
      {selectedTransaction?.paymentProofUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Payment Proof</h3>
            <div className="mb-4">
              <p><strong>Event:</strong> {selectedTransaction.event.title}</p>
              <p><strong>User:</strong> {selectedTransaction.user.first_name} {selectedTransaction.user.last_name}</p>
              <p><strong>Amount:</strong> Rp {selectedTransaction.totalPayableIDR.toLocaleString('id-ID')}</p>
              <p><strong>Uploaded:</strong> {selectedTransaction.paymentProofAt ? new Date(selectedTransaction.paymentProofAt).toLocaleString() : 'N/A'}</p>
            </div>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${selectedTransaction.paymentProofUrl}`}
              alt="Payment proof"
              width={800}
              height={600}
              className="rounded-md mx-auto"
              onError={(e) => {
                console.error('Error loading image:', e);
                e.currentTarget.src = '/images/placeholder.jpg';
              }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
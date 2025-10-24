"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerTransactionsTable } from "@/components/transactions/CustomerTransactionsTable";
import { ProofUploadModal } from "@/components/events/ProofUploadModal";
import { fetchCustomerTransactions } from "@/lib/customer-api";
import { uploadPaymentProof } from "@/lib/transactions-api";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      loadTransactions();
    }
  }, [token]);

  const loadTransactions = async () => {
    try {
      const response = await fetchCustomerTransactions(token!);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const handleUploadProof = async (transaction: any) => {
    setSelectedTransaction(transaction);
    setProofModalOpen(true);
  };

  const handleSubmitProof = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!proofFile || !selectedTransaction) return;

    setProofUploading(true);
    setProofError(null);

    try {
      await uploadPaymentProof(selectedTransaction.id, proofFile, token!);
      setProofModalOpen(false);
      await loadTransactions();
    } catch (err: any) {
      setProofError(err.message);
    } finally {
      setProofUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-white">🧾 Riwayat Transaksi</h1>
      
      <CustomerTransactionsTable
        transactions={transactions}
        onUploadProof={handleUploadProof}
      />

      <ProofUploadModal
        open={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        proofFile={proofFile}
        setProofFile={setProofFile}
        proofError={proofError}
        proofUploading={proofUploading}
        handleUploadProof={handleSubmitProof}
        eventTitle={selectedTransaction?.event?.title || ""}
        price={selectedTransaction?.totalBeforeIDR || 0}
        totalPayable={selectedTransaction?.totalPayableIDR || 0}
      />
    </div>
  );
}
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Select,
  Button,
  Spinner,
  Alert,
  Label,
} from "flowbite-react";
import { useAuth } from "@/hooks/useAuth";
import {
  formatCurrencyIDR,
  formatCountdown,
  statusColor,
} from "@/utils/formatter";
import {
  fetchManagedTransactions,
  updateTransactionStatus,
} from "@/lib/transactions-api";
import type { ManagedTransaction } from "@/lib/transactions-api";

const DEFAULT_FILTER = "WAITING_CONFIRMATION";

export function TransactionsTab() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState<ManagedTransaction[]>([]);
  const [filter, setFilter] = useState<string>(DEFAULT_FILTER);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Options for filter dropdown
  const transactionStatusOptions = useMemo(
    () => [
      { value: "", label: "Semua Status" },
      { value: "WAITING_CONFIRMATION", label: "Menunggu Konfirmasi" },
      { value: "WAITING_PAYMENT", label: "Menunggu Pembayaran" },
      { value: "DONE", label: "Selesai" },
      { value: "REJECTED", label: "Ditolak" },
      { value: "CANCELED", label: "Dibatalkan" },
      { value: "EXPIRED", label: "Kedaluwarsa" },
    ],
    []
  );

  // Fetch transactions
  const loadTransactions = useCallback(
    async (statusValue: string = filter) => {
      if (!token || user?.role !== "ORGANIZER") return;
      try {
        setLoading(true);
        const params = statusValue ? { status: statusValue } : undefined;
        const response = await fetchManagedTransactions(token, params);
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [token, user?.role, filter]
  );

  useEffect(() => {
    loadTransactions(filter);
  }, [filter, loadTransactions]);

  // Update transaction status
  const handleStatusUpdate = async (
    transactionId: string,
    status: ManagedTransaction["status"]
  ) => {
    if (!token) return;
    setLoading(true);
    setFeedback(null);

    if (["REJECTED", "CANCELED"].includes(status)) {
      const confirm = window.confirm(
        status === "REJECTED"
          ? "Tolak transaksi ini?"
          : "Batalkan transaksi ini?"
      );
      if (!confirm) {
        setLoading(false);
        return;
      }
    }

    try {
      await updateTransactionStatus(transactionId, status, token);
      await loadTransactions(filter);
      setFeedback("Status transaksi berhasil diperbarui.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-64">
          <Label htmlFor="filter-status" className="block mb-2">
            Filter Status
          </Label>
          <Select
            id="filter-status"
            value={filter}
            onChange={(e) => {
              setFeedback(null);
              setFilter(e.target.value);
            }}
          >
            {transactionStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        {feedback && (
          <Alert
            color="success"
            onDismiss={() => setFeedback(null)}
            className="sm:w-auto"
          >
            {feedback}
          </Alert>
        )}
      </div>
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      ) : transactions.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Event</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Total</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Bukti Pembayaran</TableHeadCell>
                <TableHeadCell>Aksi</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="bg-gray-800 hover:bg-gray-800/80 transition-colors"
                >
                  <TableCell className="w-64 text-sm text-gray-200">
                    <p className="font-semibold text-white">{tx.event.title}</p>
                    <p className="text-xs text-gray-400 font-mono">
                      {new Date(tx.event.startAt).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500">{tx.event.location}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">
                    <p className="font-semibold text-white">{tx.user.name}</p>
                    <p className="text-xs text-gray-400">{tx.user.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">
                    <p>{formatCurrencyIDR(tx.totalPayableIDR)}</p>
                    {tx.pointsUsedIDR > 0 && (
                      <p className="text-xs text-gray-400">
                        Poin: {formatCurrencyIDR(tx.pointsUsedIDR)}
                      </p>
                    )}
                    {tx.promoCode && (
                      <p className="text-xs text-gray-400">
                        Promo {tx.promoCode} (-
                        {formatCurrencyIDR(tx.promoDiscountIDR)})
                      </p>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-sm font-semibold ${statusColor(
                      tx.status
                    )}`}
                  >
                    {tx.status.replace(/_/g, " ")}
                    {tx.status === "WAITING_PAYMENT" && (
                      <p className="mt-1 text-xs text-gray-400">
                        Batas bayar: {formatCountdown(tx.expiresAt)}
                      </p>
                    )}
                    {tx.status === "WAITING_CONFIRMATION" &&
                      tx.decisionDueAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Auto-cancel: {formatCountdown(tx.decisionDueAt)}
                        </p>
                      )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">
                    {tx.paymentProofUrl && tx.totalPayableIDR > 0 ? (
                      <Button
                        size="xs"
                        color="light"
                        href={tx.paymentProofUrl}
                        rel="noopener noreferrer"
                      >
                        Lihat Bukti
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Belum ada bukti pembayaran
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-300">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {tx.status === "WAITING_CONFIRMATION" && (
                        <>
                          <Button
                            size="xs"
                            color="green"
                            onClick={() => handleStatusUpdate(tx.id, "DONE")}
                            disabled={loading}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="xs"
                            color="light"
                            onClick={() =>
                              handleStatusUpdate(tx.id, "REJECTED")
                            }
                            disabled={loading}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      {tx.status === "WAITING_PAYMENT" && (
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleStatusUpdate(tx.id, "CANCELED")}
                          disabled={loading}
                        >
                          Batalkan
                        </Button>
                      )}

                      {tx.status !== "WAITING_PAYMENT" &&
                        tx.status !== "WAITING_CONFIRMATION" &&
                        !tx.paymentProofUrl && <span>-</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 p-4">
          Belum ada transaksi untuk ditampilkan.
        </p>
      )}
    </div>
  );
}

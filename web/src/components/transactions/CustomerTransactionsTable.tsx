"use client";

import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { CustomerTransaction } from "@/lib/customer-api";
import {
  formatCountdown,
  formatCurrencyIDR,
  statusColor,
} from "@/utils/formatter";
import { BASE_URL } from "@/lib/config";
import { useState } from "react";
import { TicketModal } from "./TicketModal";

interface CustomerTransactionsTableProps {
  transactions: CustomerTransaction[];
  onUploadProof: (transaction: CustomerTransaction) => void;
}

export function CustomerTransactionsTable({
  transactions,
  onUploadProof,
}: CustomerTransactionsTableProps) {
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<CustomerTransaction | null>(
    null
  );

  const handleOpenTickets = (tx: CustomerTransaction) => {
    setSelectedTx(tx);
    setOpenTicketModal(true);
  };

  if (!transactions.length) {
    return (
      <Card>
        <p className="text-sm">
          Kamu belum memiliki transaksi. Mulai jelajahi event dan lakukan
          pembelian tiket.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow className="text-gray-300 uppercase">
            <TableHeadCell>Event</TableHeadCell>
            <TableHeadCell>Tiket</TableHeadCell>
            <TableHeadCell>Total Bayar</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Dibuat</TableHeadCell>
            <TableHeadCell className="text-center">Aksi</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => {
            const proofLink = tx.paymentProofUrl
              ? `${BASE_URL}${tx.paymentProofUrl}`
              : null;

            return (
              <TableRow
                key={tx.id}
                className="bg-gray-800 hover:bg-gray-800/80 transition-colors"
              >
                <TableCell className="w-64 text-sm">
                  <p className="font-semibold text-white">{tx.event.title}</p>
                  <p className="text-xs font-mono text-gray-400">
                    {new Date(tx.event.startAt).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-500">{tx.event.location}</p>
                </TableCell>
                <TableCell className="text-sm text-gray-300">
                  {tx.items
                    .map(
                      (item) =>
                        `${item.ticketType?.name ?? "Tiket"} x ${item.qty}`
                    )
                    .join(", ")}
                </TableCell>
                <TableCell className="text-sm text-gray-200">
                  <p>{formatCurrencyIDR(tx.totalPayableIDR)}</p>
                  {tx.pointsUsedIDR > 0 && (
                    <p className="text-xs text-amber-400">
                      Poin digunakan: {formatCurrencyIDR(tx.pointsUsedIDR)}
                    </p>
                  )}
                  {tx.promoCode && (
                    <p className="text-xs text-green-400">
                      Promo {tx.promoCode} ( -
                      {formatCurrencyIDR(tx.promoDiscountIDR)})
                    </p>
                  )}
                </TableCell>
                <TableCell
                  className={`text-sm font-semibold ${statusColor(tx.status)}`}
                >
                  {tx.status.replace(/_/g, " ")}
                  {tx.status === "WAITING_PAYMENT" && (
                    <p className="mt-1 text-xs text-gray-400">
                      Sisa waktu pembayaran: {formatCountdown(tx.expiresAt)}
                    </p>
                  )}
                  {tx.status === "WAITING_CONFIRMATION" && tx.decisionDueAt && (
                    <p className="mt-1 text-xs text-gray-400">
                      Menunggu approval: {formatCountdown(tx.decisionDueAt)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-300">
                  <p className="font-mono">
                    {new Date(tx.createdAt).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Bayar sebelum:{" "}
                    <span className="font-mono">
                      {new Date(tx.expiresAt).toLocaleString("id-ID")}
                    </span>
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-2">
                    {tx.totalPayableIDR > 0 &&
                      (tx.status === "WAITING_PAYMENT" ||
                        tx.status === "WAITING_CONFIRMATION") && (
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => onUploadProof(tx)}
                        >
                          {tx.paymentProofUrl
                            ? "Perbarui Bukti"
                            : "Upload Bukti"}
                        </Button>
                      )}
                    {proofLink && (
                      <Button
                        size="xs"
                        color="light"
                        href={proofLink}
                        rel="noopener noreferrer"
                      >
                        Lihat Bukti
                      </Button>
                    )}
                    {tx.status === "DONE" && (
                      <Button
                        size="xs"
                        color="purple"
                        onClick={() => handleOpenTickets(tx)}
                      >
                        Lihat Tiket
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TicketModal
        open={openTicketModal}
        onClose={() => setOpenTicketModal(false)}
        transaction={selectedTx}
      />
    </div>
  );
}

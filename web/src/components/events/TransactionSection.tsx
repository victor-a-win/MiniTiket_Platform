"use client";

import { Alert, Button, Badge, Card, Tooltip } from "flowbite-react";
import { BASE_URL } from "@/lib/config";
import { CustomerTransaction } from "@/lib/customer-api";
import { Clock, CheckCircle, XCircle, FileUp, Gift } from "lucide-react";

export function TransactionSection({
  existingTx,
  error,
  success,
  onUploadClick,
}: {
  existingTx?: CustomerTransaction;
  error: string | null;
  success: string | null;
  onUploadClick: () => void;
}) {
  if (!existingTx && !error && !success) return null;

  const renderStatusBadge = (status: string) => {
    const normalized = status.replace(/_/g, " ");
    const colorMap: Record<string, string> = {
      WAITING_PAYMENT: "warning",
      WAITING_CONFIRMATION: "purple",
      DONE: "success",
      REJECTED: "failure",
      CANCELED: "failure",
      EXPIRED: "gray",
    };
    const labelMap: Record<string, string> = {
      WAITING_PAYMENT: "Menunggu Pembayaran",
      WAITING_CONFIRMATION: "Menunggu Konfirmasi",
      DONE: "Selesai",
      REJECTED: "Ditolak",
      CANCELED: "Dibatalkan",
      EXPIRED: "Kedaluwarsa",
    };
    return (
      <Badge color={colorMap[status] || "gray"} size="sm" className="uppercase">
        {labelMap[status] ?? normalized}
      </Badge>
    );
  };

  const isFree =
    existingTx && (existingTx.totalPayableIDR ?? 0) <= 0 ? true : false;

  return (
    <Card>
      {existingTx && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-gray-400 text-sm mb-2">Status Transaksi</p>
            <div className="flex items-center gap-2">
              {renderStatusBadge(existingTx.status)}
              {existingTx.status === "WAITING_PAYMENT" && !isFree && (
                <Tooltip content="Segera unggah bukti pembayaran sebelum batas waktu berakhir">
                  <Clock size={16} className="text-yellow-400" />
                </Tooltip>
              )}
              {existingTx.status === "DONE" && (
                <CheckCircle size={16} className="text-green-400" />
              )}
              {["REJECTED", "CANCELED", "EXPIRED"].includes(
                existingTx.status
              ) && <XCircle size={16} className="text-red-400" />}
            </div>
          </div>
          <div>
            {isFree ? (
              <div className="flex items-center gap-2 text-sm text-green-300">
                <Gift size={16} />
                <span>Event gratis — tidak perlu pembayaran</span>
              </div>
            ) : existingTx.paymentProofUrl ? (
              <Button
                color="light"
                href={`${BASE_URL}${existingTx.paymentProofUrl}`}
                rel="noopener noreferrer"
              >
                <FileUp size={16} className="mr-2" />
                Lihat Bukti Pembayaran
              </Button>
            ) : (
              existingTx.status === "WAITING_PAYMENT" && (
                <Button color="purple" onClick={onUploadClick}>
                  <FileUp size={16} className="mr-2" />
                  Upload Bukti Pembayaran
                </Button>
              )
            )}
          </div>
        </div>
      )}
      {existingTx && (
        <div className="mt-4 text-sm text-gray-300 space-y-1 border-t border-gray-800 pt-3">
          <p>
            <span className="text-gray-400">Total:</span>{" "}
            <span className="font-semibold text-indigo-300">
              {isFree
                ? "Gratis"
                : `Rp ${existingTx.totalPayableIDR.toLocaleString("id-ID")}`}
            </span>
          </p>
          {existingTx.promoCode && (
            <p>
              <span className="text-gray-400">Kode Promo:</span>{" "}
              <Badge color="indigo">{existingTx.promoCode}</Badge>
            </p>
          )}
          {existingTx.pointsUsedIDR > 0 && (
            <p className="text-gray-400">
              Poin digunakan:{" "}
              <span className="text-indigo-300">
                Rp {existingTx.pointsUsedIDR.toLocaleString("id-ID")}
              </span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            Dibuat pada:{" "}
            <span className="font-mono">
              {new Date(existingTx.createdAt).toLocaleString("id-ID")}
            </span>
          </p>
        </div>
      )}
      {error && (
        <Alert color="failure" className="border border-red-500/20">
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" className="border border-green-500/20">
          {success}
        </Alert>
      )}
    </Card>
  );
}

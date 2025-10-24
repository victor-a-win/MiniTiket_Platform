"use client";

import {
  Modal,
  ModalHeader,
  ModalBody,
  FileInput,
  Button,
  Spinner,
  Label,
  Alert,
  Card,
} from "flowbite-react";
import { useState } from "react";
import { formatCurrencyIDR } from "@/utils/formatter";
import { Banknote } from "lucide-react";

export function ProofUploadModal({
  open,
  onClose,
  proofFile,
  setProofFile,
  proofError,
  proofUploading,
  handleUploadProof,
  eventTitle,
  price,
  promoDiscount,
  pointsUsed,
  totalPayable,
}: {
  open: boolean;
  onClose: () => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  proofError: string | null;
  proofUploading: boolean;
  handleUploadProof: (e: React.FormEvent<HTMLFormElement>) => void;
  eventTitle: string;
  price: number;
  promoDiscount?: number;
  pointsUsed?: number;
  totalPayable: number;
}) {
  const [showSummary] = useState(true);

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader>Pembayaran Tiket Event</ModalHeader>
      <ModalBody>
        <div className="space-y-5">
          <Card className=" bg-gradient-to-br from-gray-900/80 to-gray-950">
            <h3 className="text-md font-semibold text-white flex items-center gap-2 mb-2">
              <Banknote size={24} className="text-indigo-400" />
              Pembayaran Dituju ke:
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <span className="font-medium text-white">Bank Mandiri</span>{" "}
                (a.n.{" "}
                <span className="text-indigo-300">PT Eventify Indonesia</span>)
              </p>
              <p>
                No. Rekening:{" "}
                <span className="font-mono font-semibold text-white">
                  123-456-7890
                </span>
              </p>
              <p className="text-xs text-gray-400">
                <span className="text-red-400">*</span> Pastikan nominal
                transfer sesuai total pembayaran.
              </p>
              <hr className="my-2 border-gray-700" />
              <p>
                <span className="font-medium text-white">Atau via:</span>{" "}
                <span className="text-indigo-300">DANA / GoPay</span>
                {" — "}
                <span className="font-mono text-white">0812-3456-7890</span>
              </p>
            </div>
          </Card>
          {showSummary && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-2">
                {eventTitle}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between text-gray-200">
                  <span>Harga Tiket</span>
                  <span>{formatCurrencyIDR(price)}</span>
                </p>
                {promoDiscount && promoDiscount > 0 ? (
                  <p className="flex justify-between text-green-400">
                    <span>Diskon Promo</span>
                    <span>-{formatCurrencyIDR(promoDiscount)}</span>
                  </p>
                ) : null}
                {pointsUsed && pointsUsed > 0 ? (
                  <p className="flex justify-between text-amber-400">
                    <span>Poin Digunakan</span>
                    <span>-{formatCurrencyIDR(pointsUsed)}</span>
                  </p>
                ) : null}
                <hr className="my-2 border-gray-700" />
                <p className="flex justify-between font-semibold text-white">
                  <span>Total Bayar</span>
                  <span>{formatCurrencyIDR(totalPayable)}</span>
                </p>
              </div>
            </Card>
          )}
          <Card>
            <form className="space-y-4" onSubmit={handleUploadProof}>
              <Label htmlFor="proof-file" className="block mb-3">
                Unggah Bukti Pembayaran (JPG / PNG / PDF)
              </Label>
              <FileInput
                id="proof-file"
                className="overflow-hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              />
              {proofError && <Alert color="failure">{proofError}</Alert>}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  color="light"
                  type="button"
                  onClick={onClose}
                  disabled={proofUploading}
                >
                  Batal
                </Button>
                <Button color="purple" type="submit" disabled={proofUploading}>
                  {proofUploading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" light />
                      Mengirim...
                    </span>
                  ) : (
                    "Kirim Bukti Pembayaran"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </ModalBody>
    </Modal>
  );
}

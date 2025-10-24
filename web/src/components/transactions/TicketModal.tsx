"use client";

import { Modal, ModalHeader, ModalBody, Card, Badge } from "flowbite-react";
import { CustomerTransaction } from "@/lib/customer-api";
import { formatCurrencyIDR } from "@/utils/formatter";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Tambahan

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  transaction: CustomerTransaction | null;
}

export function TicketModal({ open, onClose, transaction }: TicketModalProps) {
  if (!transaction) return null;

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <ModalHeader>Tiket Event</ModalHeader>
      <ModalBody>
        <div className="space-y-5">
          {transaction.items.length > 0 ? (
            transaction.items.map((item) => {
              const ticketCode = `${transaction.id}-${item.id}`;
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 text-gray-200 font-mono"
                >
                  <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="text-indigo-400" size={24} />
                      <h3 className="font-semibold text-white text-lg">
                        {item.ticketType?.name ?? "Tiket"}
                      </h3>
                    </div>
                    <Badge color="success" className="uppercase">
                      {transaction.status === "DONE"
                        ? "Aktif"
                        : transaction.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <p>
                      <span className="text-gray-400">Jumlah:</span>{" "}
                      <span className="text-white font-medium">{item.qty}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Harga:</span>{" "}
                      <span className="text-indigo-300 font-medium">
                        {formatCurrencyIDR(item.unitPriceIDR)}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Total:</span>{" "}
                      <span className="text-indigo-400 font-semibold">
                        {formatCurrencyIDR(item.lineTotalIDR)}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Lokasi:</span>{" "}
                      <span className="font-medium text-white">
                        {transaction.event.location}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-400">
                    <CalendarDays size={16} className="text-indigo-400" />
                    <span>
                      {new Date(transaction.event.startAt).toLocaleString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} className="text-indigo-400" />
                    <span>{transaction.event.location}</span>
                  </div>
                  <div className="mt-5 flex flex-col items-center justify-center">
                    <QRCodeCanvas
                      value={ticketCode}
                      size={120}
                      bgColor="transparent"
                      fgColor="#8da2fb"
                    />
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              Tidak ada tiket yang terdaftar untuk transaksi ini.
            </p>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}

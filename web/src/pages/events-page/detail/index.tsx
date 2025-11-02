"use client";
import { useEffect, useState, FormEvent } from "react";
import { Event, EventDetail } from "@/interfaces/event.interface";
import { fetchEventDetails } from "@/lib/api/events";
import { EventHeader } from "@/components/events/EventHeader";
import { TicketSelector } from "@/components/events/TicketSelector";
import { ReviewsSection } from "@/components/events/ReviewsSection";
import { TransactionSection } from "@/components/events/TransactionSection";
import { ProofUploadModal } from "@/components/events/ProofUploadModal";
import { useAuth } from "@/hooks/useAuth";
import { createTransaction, uploadPaymentProof } from "@/lib/transactions-api";
import { fetchCustomerTransactions } from "@/lib/customer-api";
import { transformToEventDetail } from "@/utils/eventTransformer";
import type { EventDetail as ApiEventDetail } from "@/lib/events-api";

export const dynamic = 'force-dynamic';

export default function EventDetailPage({ id }: { id: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [usePoints, setUsePoints] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [existingTx, setExistingTx] = useState<any>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const { token, user } = useAuth();

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && id && typeof id === "string") {
      fetchEventDetails(id)
        .then(eventData => {
          const transformedEvent = transformToEventDetail(eventData);
          setEvent(transformedEvent);
        })
        .catch((err) => {
          console.error("Failed to fetch event details:", err);
          setEvent(null);
        });
    }
  }, [id, isClient]);

  useEffect(() => {
    if (isClient && token) {
      loadTransactions();
    }
  }, [token, isClient]);

  const loadTransactions = async () => {
    try {
      const response = await fetchCustomerTransactions(token!);
      setTransactions(response.data);
      
      // Check if user already has a transaction for this event
      const existing = response.data.find((tx: any) => tx.eventId === id);
      setExistingTx(existing);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 p-8 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 p-8 flex items-center justify-center">
        <div className="text-white text-lg">Loading event details...</div>
      </div>
    );
  }

  const handleUploadProof = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!proofFile || !existingTx) {
      setProofError("Please select a file and ensure you have a pending transaction");
      return;
    }

    setProofUploading(true);
    setProofError(null);

    try {
      await uploadPaymentProof(existingTx.id, proofFile, token!);
      setSuccess("Payment proof uploaded successfully! Please wait for verification.");
      setProofModalOpen(false);
      setProofFile(null);
      
      // Refresh transactions to get updated status
      await loadTransactions();
    } catch (err: any) {
      console.error("Failed to upload payment proof:", err);
      setProofError(err.message || "Failed to upload payment proof. Please try again.");
    } finally {
      setProofUploading(false);
    }
  };

  const handleCheckout = async () => {
    if (!token || !user) {
      setError("Please login to continue");
      return;
    }

    if (!selectedTicket) {
      setError("Please select a ticket type");
      return;
    }

    try {
      setError(null);
      const ticketType = event.ticketTypes.find(t => t.id === selectedTicket);
      if (!ticketType) {
        setError("Invalid ticket type selected");
        return;
      }

      const transactionData = {
        eventId: id,
        ticketTypeId: selectedTicket,
        qty: quantity,
        usePoints,
        promoCode: promoCode || undefined
      };

      const response = await createTransaction(transactionData, token);
      setSuccess("Transaction created successfully! Please upload payment proof.");
      
      // Refresh transactions to show the new one
      await loadTransactions();
    } catch (err: any) {
      console.error("Failed to create transaction:", err);
      setError(err.message || "Failed to create transaction. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 p-4 md:p-8">
        <EventHeader event={{ ...(event as any), organizer: { ...(event as any).organizer, userId: ((event as any).organizer?.userId ?? "") as string } } as ApiEventDetail} />
        
        <TransactionSection
          existingTx={existingTx}
          error={error}
          success={success}
          onUploadClick={() => setProofModalOpen(true)}
        />

        {(!existingTx || ['REJECTED', 'CANCELED', 'EXPIRED'].includes(existingTx.status)) && (
          <TicketSelector
            event={{
              ...event,
              organizer: {
                ...event.organizer,
                userId: event.organizer?.userId ?? "",
                user: event.organizer?.user ?? { email: "" }
              }
            }}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
            qty={quantity}
            setQty={setQuantity}
            onCheckout={handleCheckout}
            userPointsBalance={user?.pointsBalance || 0}
            usePoints={usePoints}
            setUsePoints={setUsePoints}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
          />
        )}

        <ReviewsSection
          reviews={event.reviews || []}
          transactions={transactions}
          eventId={id}
          token={token}
          onRefresh={loadTransactions}
        />

        <ProofUploadModal
          open={proofModalOpen}
          onClose={() => setProofModalOpen(false)}
          proofFile={proofFile}
          setProofFile={setProofFile}
          proofError={proofError}
          proofUploading={proofUploading}
          handleUploadProof={handleUploadProof}
          eventTitle={event.title}
          price={event.ticketTypes[0]?.priceIDR * quantity || 0}
          totalPayable={existingTx?.totalPayableIDR || event.ticketTypes[0]?.priceIDR * quantity || 0}
        />
      </div>
  );
}
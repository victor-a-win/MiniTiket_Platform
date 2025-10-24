"use client";

import { useState } from "react";
import {
  Card,
  Textarea,
  Button,
  Spinner,
  Alert,
  Tooltip,
  Label,
} from "flowbite-react";
import { Star } from "lucide-react";
import { EventReview } from "@/lib/events-api";
import { CustomerTransaction } from "@/lib/customer-api";
import { submitEventReview } from "@/lib/reviews-api";

export function ReviewsSection({
  reviews,
  transactions,
  eventId,
  token,
  onRefresh,
}: {
  reviews: EventReview[];
  transactions: CustomerTransaction[];
  eventId: string;
  token?: string | null;
  onRefresh?: () => Promise<void>;
}) {
  const [rating, setRating] = useState<number>(5);
  const [hovered, setHovered] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const canReview = transactions.some(
    (tx) => tx.eventId === eventId && tx.status === "DONE"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token)
      return setFeedback({
        type: "error",
        msg: "Silakan login terlebih dahulu.",
      });
    if (!canReview)
      return setFeedback({
        type: "error",
        msg: "Kamu belum menyelesaikan transaksi event ini.",
      });

    try {
      setSubmitting(true);
      setFeedback(null);

      await submitEventReview({ eventId, rating, comment }, token);
      setFeedback({ type: "success", msg: "Ulasan berhasil dikirim!" });
      setRating(5);
      setComment("");
      if (onRefresh) await onRefresh();
    } catch (err) {
      setFeedback({ type: "error", msg: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 mt-10">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        Ulasan Pengunjung
      </h2>
      {canReview && (
        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label className="block mb-2">Rating Kamu</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Tooltip
                    key={star}
                    content={`${star} Bintang`}
                    className="text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={24}
                        strokeWidth={2}
                        className={`transition-all duration-150 ${
                          star <= (hovered || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <Label className="block mb-2">Ceritakan Pengalamanmu</Label>
              <Textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan pendapatmu tentang event ini..."
                className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 rounded-md"
              />
            </div>
            {feedback && (
              <Alert
                color={feedback.type === "success" ? "success" : "failure"}
                className="rounded-lg"
              >
                {feedback.msg}
              </Alert>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                color="purple"
                disabled={submitting}
                className="px-6"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" light />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim Ulasan"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    strokeWidth={2}
                    className={`${
                      i <= r.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-200 italic line-clamp-3">
                {r.comment ?? "Tidak ada komentar."}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                oleh {r.user.name} •{" "}
                <span className="font-mono">
                  {new Date(r.createdAt).toLocaleDateString("id-ID")}
                </span>
              </p>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-900/60 border border-gray-800 text-center p-6">
            <p className="text-gray-400 text-sm">
              Belum ada ulasan untuk event ini. Jadilah yang pertama memberi
              feedback
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}

import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { VerifyToken } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema";

const router = Router();

/**
 * GET /api/reviews
 * Menampilkan semua review (opsional: filter by eventId)
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.query;

    const reviews = await prisma.review.findMany({
      where: eventId ? { eventId: String(eventId) } : {},
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * POST /api/reviews
 * Membuat review baru (hanya user yang sudah menyelesaikan transaksi)
 */
router.post(
  "/",
  VerifyToken,
  validateSchema(createReviewSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, rating, comment } = req.body;
      const userId = req.user!.id;

      // Periksa apakah user pernah punya transaksi DONE untuk event ini
      const validPurchase = await prisma.transaction.findFirst({
        where: {
          userId,
          eventId,
          status: "DONE",
        },
      });

      if (!validPurchase) {
        res.status(403).json({
          error:
            "You can only review events you have attended (completed transaction).",
        });
        return;
      }

      // Pastikan belum pernah review event yang sama
      const existingReview = await prisma.review.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });

      if (existingReview) {
        res.status(400).json({
          error: "You have already reviewed this event.",
        });
        return;
      }

      // Buat review baru
      const review = await prisma.review.create({
        data: {
          eventId,
          userId,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      // Update rata-rata rating pada OrganizerProfile
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      });

      if (event) {
        const avg = await prisma.review.aggregate({
          where: { eventId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await prisma.organizerProfile.update({
          where: { id: event.organizerId },
          data: {
            ratingsAvg: avg._avg.rating ?? 0,
            ratingsCount: avg._count.rating,
          },
        });
      }

      res.status(201).json({
        message: "Review created successfully",
        data: review,
      });
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({ error: "Failed to create review" });
    }
  }
);

/**
 * PUT /api/reviews/:id
 * Update review (hanya oleh pembuat review)
 */
router.put(
  "/:id",
  VerifyToken,
  validateSchema(updateReviewSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user!.id;

      // Cari review yang akan diupdate
      const existingReview = await prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      // Pastikan hanya pembuat review yang bisa mengupdate
      if (existingReview.userId !== userId) {
        res.status(403).json({ error: "You can only update your own reviews" });
        return;
      }

      // Update review
      const updatedReview = await prisma.review.update({
        where: { id },
        data: {
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      // Update rata-rata rating organizer
      const event = await prisma.event.findUnique({
        where: { id: existingReview.eventId },
        include: { organizer: true },
      });

      if (event) {
        const avg = await prisma.review.aggregate({
          where: { eventId: existingReview.eventId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await prisma.organizerProfile.update({
          where: { id: event.organizerId },
          data: {
            ratingsAvg: avg._avg.rating ?? 0,
            ratingsCount: avg._count.rating,
          },
        });
      }

      res.json({
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (err) {
      console.error("Error updating review:", err);
      res.status(500).json({ error: "Failed to update review" });
    }
  }
);

/**
 * DELETE /api/reviews/:id
 * Menghapus review (hanya oleh pembuat review)
 */
router.delete(
  "/:id",
  VerifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Cari review yang akan dihapus
      const existingReview = await prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        res.status(404).json({ error: "Review not found" });
        return;
      }

      // Pastikan hanya pembuat review yang bisa menghapus
      if (existingReview.userId !== userId) {
        res.status(403).json({ error: "You can only delete your own reviews" });
        return;
      }

      const eventId = existingReview.eventId;

      // Hapus review
      await prisma.review.delete({
        where: { id },
      });

      // Update rata-rata rating organizer
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      });

      if (event) {
        const avg = await prisma.review.aggregate({
          where: { eventId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await prisma.organizerProfile.update({
          where: { id: event.organizerId },
          data: {
            ratingsAvg: avg._avg.rating ?? 0,
            ratingsCount: avg._count.rating,
          },
        });
      }

      res.json({ message: "Review deleted successfully" });
    } catch (err) {
      console.error("Error deleting review:", err);
      res.status(500).json({ error: "Failed to delete review" });
    }
  }
);

export default router;

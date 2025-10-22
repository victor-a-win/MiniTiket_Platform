import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate";
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
} from "../schemas/transaction.schema";
import { TxStatus } from "@prisma/client";
import { upload } from "../middlewares/upload";

const router = Router();

/**
 * GET /api/transactions
 * Mendapatkan daftar transaksi milik user login
 */
router.get(
  "/",
  VerifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: req.user!.id },
        include: {
          event: {
            select: { title: true, location: true, startAt: true, endAt: true },
          },
          items: {
            include: {
              ticketType: { select: { name: true, priceIDR: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: transactions });
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
);

/**
 * POST /api/transactions
 * Membuat transaksi baru (checkout tiket)
 */
router.post(
  "/",
  VerifyToken,
  validateSchema(createTransactionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, ticketTypeId, qty, usePoints, promoCode } = req.body;

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { ticketTypes: true },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId);
      if (!ticketType) {
        res.status(400).json({ error: "Invalid ticket type" });
        return;
      }

      const unitPrice = ticketType.priceIDR;
      const subtotal = unitPrice * qty;

      // === Apply promo ===
      let promoDiscount = 0;
      if (promoCode) {
        const promo = await prisma.promotion.findFirst({
          where: {
            eventId,
            code: promoCode,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
        });
        if (!promo) {
          res.status(400).json({ error: "Invalid or expired promo code" });
          return;
        }

        promoDiscount =
          promo.type === "PERCENT"
            ? Math.floor((promo.value / 100) * subtotal)
            : promo.value;
      }

      // === Apply points ===
      const user = await prisma.users.findUnique({
        where: { id: req.user!.id },
      });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      let pointsUsed = 0;
      if (usePoints && user.user_points > 0) {
        pointsUsed = Math.min(user.user_points, subtotal - promoDiscount);
        await prisma.users.update({
          where: { id: user.id },
          data: { user_points: { decrement: pointsUsed } },
        });
      }

      const totalPayable = subtotal - promoDiscount - pointsUsed;

      // === Tentukan status awal ===
      const initialStatus =
        totalPayable <= 0 ? "WAITING_CONFIRMATION" : "WAITING_PAYMENT";

      // === Buat transaksi ===
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          eventId,
          status: initialStatus,
          totalBeforeIDR: subtotal,
          pointsUsedIDR: pointsUsed,
          promoCode: promoCode ?? null,
          promoDiscountIDR: promoDiscount,
          totalPayableIDR: totalPayable,
          expiresAt:
            initialStatus === "WAITING_PAYMENT"
              ? new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 jam
              : new Date(Date.now()), // langsung aktif untuk gratis
          decisionDueAt:
            initialStatus === "WAITING_CONFIRMATION"
              ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 hari
              : null,
          items: {
            create: [
              {
                ticketTypeId,
                qty,
                unitPriceIDR: unitPrice,
                lineTotalIDR: subtotal,
              },
            ],
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              location: true,
              ticketTypes: {
                select: {
                  id: true,
                  name: true,
                  priceIDR: true,
                  quota: true,
                },
              },
            },
          },
          items: {
            include: {
              ticketType: { select: { id: true, name: true, priceIDR: true } },
            },
          },
        },
      });

      res.status(201).json({
        message:
          totalPayable <= 0
            ? "Free ticket claimed successfully — no payment required"
            : "Transaction created successfully",
        data: transaction,
      });
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  }
);

/**
 * POST /api/transactions/:id/proof
 * Upload bukti pembayaran (file upload)
 */
router.post(
  "/:id/proof",
  VerifyToken,
  upload.single("paymentProof"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // === Validasi file ===
      if (!(req as any).file) {
        res
          .status(400)
          .json({ error: "File bukti pembayaran wajib diunggah." });
        return;
      }

      // === Ambil transaksi ===
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { user: true, event: true },
      });
      if (!transaction) {
        res.status(404).json({ error: "Transaksi tidak ditemukan." });
        return;
      }

      // === Pastikan transaksi milik user yang sedang login ===
      if (transaction.userId !== req.user!.id) {
        res
          .status(403)
          .json({ error: "Tidak diizinkan mengunggah bukti pembayaran ini." });
        return;
      }

      // === Pastikan status masih menunggu pembayaran ===
      if (transaction.status !== TxStatus.WAITING_PAYMENT) {
        res.status(400).json({
          error: `Tidak dapat upload bukti untuk transaksi dengan status ${transaction.status}.`,
        });
        return;
      }

      // === Simpan file bukti ke DB ===
      const proofUrl = `/uploads/${(req as any).file.filename}`;
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          paymentProofUrl: proofUrl,
          paymentProofAt: new Date(),
          status: TxStatus.WAITING_CONFIRMATION,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              location: true,
              startAt: true,
              endAt: true,
              ticketTypes: {
                select: { id: true, name: true, priceIDR: true },
              },
            },
          },
          items: {
            include: {
              ticketType: {
                select: { id: true, name: true, priceIDR: true },
              },
            },
          },
        },
      });

      res.json({
        message: "Bukti pembayaran berhasil diunggah.",
        data: updated,
      });
    } catch (err: any) {
      console.error("Error uploading proof:", err);
      res.status(500).json({
        error: "Terjadi kesalahan saat mengunggah bukti pembayaran.",
      });
    }
  }
);

/**
 * PUT /api/transactions/:id/status
 * Organizer/Admin mengubah status transaksi
 */
router.put(
  "/:id/status",
  VerifyToken,
  EOGuard,
  validateSchema(updateTransactionStatusSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const tx = await prisma.transaction.findUnique({
        where: { id },
        include: {
          user: true,
          event: { select: { organizerId: true } },
        },
      });
      if (!tx) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      // Since EOGuard already ensures user is event organizer, check if they own the event
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      if (tx.event?.organizerId !== organizer.id) {
        res
          .status(403)
          .json({ error: "Unauthorized to update this transaction" });
        return;
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: { status },
      });

      // rollback points jika dibatalkan/rejected
      if (["CANCELED", "REJECTED", "EXPIRED"].includes(status)) {
        await prisma.users.update({
          where: { id: tx.userId },
          data: { user_points: { increment: tx.pointsUsedIDR } },
        });
      }

      res.json({
        message: "Transaction status updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).json({ error: "Failed to update transaction status" });
    }
  }
);

/**
 * GET /api/transactions/manage
 * Menampilkan transaksi (Khusus Organizer)
 */
router.get(
  "/manage",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query as { status?: string };

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      where.event = { organizerId: organizer.id };

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startAt: true,
              endAt: true,
              location: true,
            },
          },
          items: {
            include: {
              ticketType: { select: { name: true, priceIDR: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: transactions });
    } catch (err) {
      console.error("Error fetching managed transactions:", err);
      res.status(500).json({ error: "Failed to fetch managed transactions" });
    }
  }
);

export default router;

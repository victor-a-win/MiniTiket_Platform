import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "../schemas/promotion.schema";

const router = Router();

/**
 * GET /api/promotions
 * Menampilkan semua promo (dapat difilter berdasarkan eventId)
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.query;

    const promotions = await prisma.promotion.findMany({
      where: eventId ? { eventId: String(eventId) } : {},
      orderBy: { startsAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            startAt: true,
          },
        },
      },
    });

    res.json({ data: promotions });
  } catch (err) {
    console.error("Error fetching promotions:", err);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

/**
 * POST /api/promotions
 * Membuat promo baru (khusus ORGANIZER)
 */
router.post(
  "/",
  VerifyToken,
  EOGuard,
  validateSchema(createPromotionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        eventId,
        code,
        type,
        value,
        minSpendIDR,
        startsAt,
        endsAt,
        maxUses,
      } = req.body;

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: Number(req.user!.id) },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      if (event.organizerId !== organizer.id) {
        res
          .status(403)
          .json({ error: "Cannot create promotion for this event" });
        return;
      }

      const existing = await prisma.promotion.findFirst({
        where: { eventId, code },
      });
      if (existing) {
        res
          .status(400)
          .json({ error: "Promotion code already exists for this event" });
        return;
      }

      const promotion = await prisma.promotion.create({
        data: {
          eventId,
          code,
          type,
          value,
          minSpendIDR,
          startsAt,
          endsAt,
          maxUses,
        },
      });

      res.status(201).json({
        message: "Promotion created successfully",
        data: promotion,
      });
    } catch (err) {
      console.error("Error creating promotion:", err);
      res.status(500).json({ error: "Failed to create promotion" });
    }
  }
);

/**
 * PUT /api/promotions/:id
 * Update promo (khusus ORGANIZER)
 */
router.put(
  "/:id",
  VerifyToken,
  EOGuard,
  validateSchema(updatePromotionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: Number(req.user!.id) },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: "Promotion not found" });
        return;
      }

      const event = await prisma.event.findUnique({
        where: { id: existing.eventId },
      });
      if (!event || event.organizerId !== organizer.id) {
        res
          .status(403)
          .json({ error: "Cannot update promotion for this event" });
        return;
      }

      const updated = await prisma.promotion.update({
        where: { id },
        data: req.body,
      });

      res.json({
        message: "Promotion updated successfully",
        data: updated,
      });
    } catch (err) {
      console.error("Error updating promotion:", err);
      res.status(500).json({ error: "Failed to update promotion" });
    }
  }
);

/**
 * DELETE /api/promotions/:id
 * Menghapus promo (khusus ORGANIZER)
 */
router.delete(
  "/:id",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: Number(req.user!.id) },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: "Promotion not found" });
        return;
      }

      const event = await prisma.event.findUnique({
        where: { id: existing.eventId },
      });
      if (!event || event.organizerId !== organizer.id) {
        res
          .status(403)
          .json({ error: "Cannot delete promotion for this event" });
        return;
      }

      await prisma.promotion.delete({ where: { id } });

      res.json({ message: "Promotion deleted successfully" });
    } catch (err) {
      console.error("Error deleting promotion:", err);
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  }
);

/**
 * GET /api/promotions/mine
 * Menampilkan promosi (khusus ORGANIZER)
 */
router.get(
  "/mine",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: Number(req.user!.id) },
      });
      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const promotions = await prisma.promotion.findMany({
        where: {
          event: {
            organizerId: organizer.id,
          },
        },
        orderBy: { startsAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startAt: true,
              endAt: true,
            },
          },
        },
      });

      res.json({ data: promotions });
    } catch (err) {
      console.error("Error fetching organizer promotions:", err);
      res.status(500).json({ error: "Failed to fetch organizer promotions" });
    }
  }
);

export default router;

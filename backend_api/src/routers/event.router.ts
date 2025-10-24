import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  VerifyToken,
  EOGuard,
  OrganizerProfileGuard,
} from "../middlewares/auth.middleware";
import { validateSchema } from "../middlewares/validate";
import { createEventSchema, updateEventSchema } from "../schemas/event.schema";

const router = Router();

/**
 * GET /api/events/mine
 * Menampilkan daftar event organizer sekarang
 */
router.get(
  "/mine",
  VerifyToken,
  EOGuard,
  OrganizerProfileGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const events = await prisma.event.findMany({
        where: { organizerId: organizer.id },
        include: {
          organizer: { select: { displayName: true, ratingsAvg: true } },
          ticketTypes: true,
          promotions: true,
          reviews: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: events });
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      res.status(500).json({ error: "Failed to fetch organizer events" });
    }
  }
);

/**
 * GET /api/events
 * Menampilkan daftar event (public)
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      location,
      from,
      to,
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 12;
    const skip = (pageNum - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: "insensitive" };

    if (from || to) {
      where.startAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: { select: { displayName: true, ratingsAvg: true } },
          ticketTypes: true,
          promotions: { where: { endsAt: { gt: new Date() } } },
          reviews: true,
        },
        orderBy: { startAt: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

/**
 * GET /api/events/:id
 * Mendapatkan detail event
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        ticketTypes: true,
        promotions: true,
        reviews: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(event);
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ error: "Failed to fetch event details" });
  }
});

/**
 * POST /api/events
 * Membuat event baru
 */
router.post(
  "/",
  VerifyToken,
  EOGuard,
  validateSchema(createEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        description,
        category,
        location,
        startAt,
        endAt,
        isPaid,
        capacity,
        ticketTypes,
      } = req.body;

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!organizer) {
        res.status(403).json({ error: "Organizer profile not found" });
        return;
      }

      const event = await prisma.event.create({
        data: {
          organizerId: organizer.id,
          userId: req.user!.id, // Add userId from authenticated user
          title,
          description,
          category,
          location,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          isPaid,
          capacity,
          seatsAvailable: capacity,
          ticketTypes: {
            create:
              ticketTypes?.map((t: any) => ({
                name: t.name,
                priceIDR: t.priceIDR,
                quota: t.quota ?? null,
              })) ?? [],
          },
        },
        include: { ticketTypes: true },
      });

      res.status(201).json(event);
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

/**
 * PUT /api/events/:id
 * Memperbarui event dan menampilkan ticketTypes
 */
router.put(
  "/:id",
  VerifyToken,
  EOGuard,
  validateSchema(updateEventSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        category,
        location,
        startAt,
        endAt,
        isPaid,
        capacity,
        ticketTypes,
      } = req.body;

      // === Pastikan organizer valid ===
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      const event = await prisma.event.findUnique({
        where: { id },
        include: { ticketTypes: true },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      if (organizer && event.organizerId !== organizer.id) {
        res.status(403).json({ error: "Unauthorized" });
        return;
      }

      // === Update event utama ===
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          category,
          location,
          startAt: startAt ? new Date(startAt) : event.startAt,
          endAt: endAt ? new Date(endAt) : event.endAt,
          isPaid,
          capacity,
          seatsAvailable:
            capacity && capacity !== event.capacity
              ? capacity
              : event.seatsAvailable,
        },
        include: {
          ticketTypes: {
            select: { id: true, name: true, priceIDR: true, quota: true },
          },
        },
      });

      // === Update daftar ticketTypes (opsional) ===
      if (Array.isArray(ticketTypes)) {
        // Hapus semua ticket lama, buat ulang (sederhana)
        await prisma.ticketType.deleteMany({ where: { eventId: id } });
        await prisma.ticketType.createMany({
          data: ticketTypes.map((t: any) => ({
            eventId: id,
            name: t.name,
            priceIDR: Number(t.priceIDR) || 0,
            quota: t.quota ?? null,
          })),
        });
      }

      // === Ambil kembali event lengkap setelah perubahan ===
      const refreshed = await prisma.event.findUnique({
        where: { id },
        include: {
          ticketTypes: {
            select: { id: true, name: true, priceIDR: true, quota: true },
          },
        },
      });

      res.json(refreshed);
    } catch (err) {
      console.error("Error updating event:", err);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete(
  "/:id",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Find the organizer
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      // Find the event and verify ownership
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      if (event.organizerId !== organizer.id) {
        res.status(403).json({ error: "Unauthorized to delete this event" });
        return;
      }

      // Check if there are any transactions for this event
      const transactions = await prisma.transaction.findMany({
        where: { eventId: id },
        take: 1, // We just need to know if any exist
      });

      if (transactions.length > 0) {
        res.status(400).json({
          error: "Cannot delete event with existing transactions",
        });
        return;
      }

      // Delete the event (this will cascade delete related records due to Prisma schema)
      await prisma.event.delete({
        where: { id },
      });

      res.json({ message: "Event deleted successfully" });
    } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);

/**
 * GET /api/events/organizers/:id
 * Mendapatkan detail lengkap organizer beserta event dan review
 */
router.get(
  "/organizers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Ambil data organizer + relasi
      const organizer = await prisma.organizerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          events: {
            include: {
              ticketTypes: true,
              promotions: true,
              reviews: {
                include: {
                  user: {
                    select: {
                      first_name: true,
                      last_name: true,
                    },
                  },
                },
              },
            },
            orderBy: { startAt: "asc" },
          },
        },
      });

      if (!organizer) {
        res.status(404).json({ error: "Organizer not found" });
        return;
      }

      // Ambil semua review yang ditulis untuk event milik organizer ini
      const organizerReviews = await prisma.review.findMany({
        where: {
          event: { organizerId: id },
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
          event: { select: { title: true, startAt: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        id: organizer.id,
        displayName: organizer.displayName,
        bio: organizer.bio,
        ratingsAvg: organizer.ratingsAvg,
        ratingsCount: organizer.ratingsCount,
        user: organizer.user,
        events: organizer.events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          category: e.category,
          location: e.location,
          startAt: e.startAt,
          endAt: e.endAt,
          isPaid: e.isPaid,
          capacity: e.capacity,
          seatsAvailable: e.seatsAvailable,
          ticketTypes: e.ticketTypes,
          promotions: e.promotions,
          reviews: e.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            user: r.user,
          })),
        })),
        reviews: organizerReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user,
          event: r.event,
        })),
      });
    } catch (err) {
      console.error("Error fetching organizer detail:", err);
      res.status(500).json({ error: "Failed to fetch organizer detail" });
    }
  }
);

// In event.router.ts - replace the current statistics endpoint
router.get(
  "/organizer/statistics",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupBy = "month" } = req.query;

      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      // Get organizer's events with transactions
      const events = await prisma.event.findMany({
        where: { organizerId: organizer.id },
        include: {
          ticketTypes: true,
          Transaction: {
            where: { status: "DONE" },
            include: { items: true },
          },
        },
      });

      // Group by period based on groupBy parameter
      const groupedData = groupEventsByPeriod(events, groupBy as string);

      res.json(groupedData);
    } catch (err) {
      console.error("Error fetching organizer statistics:", err);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  }
);

// Helper function to group events by period
function groupEventsByPeriod(events: any[], groupBy: string) {
  const groups: { [key: string]: any } = {};

  events.forEach((event) => {
    let periodKey: string;

    // Determine period key based on groupBy
    if (groupBy === "year") {
      periodKey = new Date(event.createdAt).getFullYear().toString();
    } else if (groupBy === "month") {
      const date = new Date(event.createdAt);
      periodKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    } else {
      // day
      const date = new Date(event.createdAt);
      periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    if (!groups[periodKey]) {
      groups[periodKey] = {
        period: periodKey,
        event_count: 0,
        tickets_sold: 0,
        total_revenue: 0,
      };
    }

    // Count this event
    groups[periodKey].event_count += 1;

    // Calculate tickets sold and revenue from transactions
    event.Transaction.forEach((transaction: any) => {
      groups[periodKey].total_revenue += transaction.totalPayableIDR;

      transaction.items.forEach((item: any) => {
        groups[periodKey].tickets_sold += item.qty;
      });
    });
  });

  // Convert to array and sort by period
  return Object.values(groups).sort((a: any, b: any) =>
    a.period.localeCompare(b.period)
  );
}

router.get(
  "/organizer/events",
  VerifyToken,
  EOGuard,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizer = await prisma.organizerProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!organizer) {
        res.status(404).json({ error: "Organizer profile not found" });
        return;
      }

      const events = await prisma.event.findMany({
        where: { organizerId: organizer.id },
        include: {
          ticketTypes: true,
          promotions: true,
          Transaction: {
            where: { status: "DONE" },
            select: { id: true, totalPayableIDR: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: events });
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      res.status(500).json({ error: "Failed to fetch organizer events" });
    }
  }
);

export default router;

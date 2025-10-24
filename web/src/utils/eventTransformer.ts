import { Event, EventDetail } from "@/interfaces/event.interface";

export function transformToEventDetail(eventData: Event): EventDetail {
  return {
    id: eventData.id,
    title: eventData.name || eventData.title || "Event",
    description: eventData.description || null,
    category: eventData.category || null,
    location: eventData.location,
    startAt: eventData.startAt || eventData.start_date,
    endAt: eventData.endAt || eventData.end_date,
    isPaid:
      eventData.isPaid !== undefined ? eventData.isPaid : eventData.price > 0,
    capacity: eventData.capacity || eventData.seats || 0,
    seatsAvailable: eventData.seatsAvailable || eventData.seats || 0,
    coverImageUrl: eventData.coverImageUrl || eventData.image_url || null,
    organizerId:
      eventData.organizerId || eventData.user_id || "unknown-organizer",
    organizer: {
      displayName:
        (eventData.organizer as any)?.displayName ||
        (eventData.user
          ? `${eventData.user.first_name} ${eventData.user.last_name}`
          : "Unknown Organizer"),
      ratingsAvg: (eventData.organizer as any)?.ratingsAvg || 0,
      userId: (eventData.organizer as any)?.userId || eventData.user_id,
      user: (eventData.organizer as any)?.user || {
        email: "unknown@example.com",
      },
    },
    ticketTypes: eventData.ticketTypes || [
      {
        id: "default",
        name: "General Admission",
        priceIDR: eventData.price || 0,
        quota: eventData.seats || eventData.capacity || null,
      },
    ],
    promotions: eventData.promotions || [],
    reviews: eventData.reviews || [],
    // Include old properties for compatibility
    name: eventData.name,
    price: eventData.price,
    start_date: eventData.start_date,
    end_date: eventData.end_date,
    seats: eventData.seats,
  };
}

"use client";
import { useEffect, useState } from "react";
import { Event } from "@/interfaces/event.interface";
import EventDetail from "@/components/events/EventDetail";
import Link from "next/link";
import { fetchEventDetails } from "@/lib/api/events";

export default function EventDetailPage({id}: { id: string }) {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchEventDetails(id)
        .then(setEvent)
        .catch(() => setEvent(null));
    }
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 p-8">
      <EventDetail event={event} />
      <div className="mt-8">
        <Link href={`/events/${event.id}`}>
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition">
            Beli Tiket
          </button>
        </Link>
      </div>
    </div>
  );
}

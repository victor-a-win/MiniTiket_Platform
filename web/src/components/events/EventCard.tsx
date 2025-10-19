import Link from "next/link";
import { Event } from "@/interfaces/event.interface";

export default function EventCard({ event }: { key:string, event: Event }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md bg-gray-900 text-white transition hover:scale-105 hover:shadow-xl">
      <div className="p-4">
        <h3 className="font-bold text-lg">{event.name}</h3>
        <p className="text-gray-400">📅 {new Date(event.start_date).toLocaleDateString("id-ID")}</p>
        <p className="text-gray-400">📍 {event.location}</p>
        <p className="font-semibold mt-2">
          {event.price === 0 ? "Gratis" : `Rp ${event.price.toLocaleString("id-ID")}`}
        </p>
        <Link href={`/events/${event.id}`}>
          <button className="mt-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-2 rounded transition">
            Lihat Detail
          </button>
        </Link>
      </div>
    </div>
  );
}

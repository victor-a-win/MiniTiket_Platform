import { Event } from "@/interfaces/event.interface";
import Link from "next/link";

export default function EventDetail({ event }: { event: Event }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
      <p className="mb-2">{event.description}</p>
      <p><b>Category:</b> {event.category}</p>
      <p><b>Location:</b> {event.location}</p>
      <p><b>Date:</b> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</p>
      <p><b>Price:</b> {event.price === 0 ? "Free" : `Rp ${event.price?.toLocaleString("id-ID") ?? 0}`}</p>
      <p><b>Remaining Seats:</b> {event.seats}</p>
      <p><b>Organizer:</b> {event.user ? `${event.user.first_name} ${event.user.last_name}` : "-"}</p>
      <Link href={`/transactions/new?event=${event.id}`}>
        <button className="mt-4 bg-green-500 hover:bg-green-700 px-4 py-2 rounded text-white transition">Beli Tiket</button>
      </Link>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/events/EventCard";
import { Event } from "@/interfaces/event.interface";
import { fetchEvents } from "@/lib/api/events";

export default function EventsLandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  const filtered = events.filter(e =>
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase())) &&
    (category ? e.category === category : true) &&
    (location ? e.location === location : true)
  );

  const categories = Array.from(new Set(events.map(e => e.category)));
  const locations = Array.from(new Set(events.map(e => e.location)));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
        Daftar Event
      </h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari event..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-3 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        >
          <option value="">Semua Lokasi</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length > 0 ? (
          filtered.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10 col-span-full">
            Tidak ada event ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

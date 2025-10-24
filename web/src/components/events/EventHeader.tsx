"use client";

import Link from "next/link";
import { Badge, Card, Tooltip } from "flowbite-react";
import { CalendarDays, MapPin, Users, Tag, Star, Ticket } from "lucide-react";
import { formatCurrencyIDR } from "@/utils/formatter";
import type { EventDetail } from "@/lib/events-api";

export function EventHeader({ event }: { event: EventDetail }) {
  const start = new Date(event.startAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const end = new Date(event.endAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className="relative overflow-hidden border border-gray-700 bg-gradient-to-b from-gray-800/90 to-gray-900/90 p-3 md:p-5 lg:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge color="purple" className="uppercase">
            {event.category ?? "General"}
          </Badge>
          {event.promotions.length > 0 && (
            <Badge color="success">Promo tersedia</Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-indigo-400" />
          <span>
            {start} — {end}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-indigo-400" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />
          <span>
            <span className="font-mono">
              {event.seatsAvailable}/{event.capacity}
            </span>{" "}
            seat tersedia
          </span>
        </div>
      </div>
      <p className="mt-5 text-gray-300 leading-relaxed">
        {event.description ?? (
          <span className="italic text-gray-500">
            Belum ada deskripsi event.
          </span>
        )}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 pt-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Diselenggarakan oleh</p>
          <Link
            href={`/organizer/${event.organizerId ?? ""}`}
            className="text-base font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {event.organizer.displayName}
          </Link>
        </div>
        {event.organizer.ratingsAvg > 0 && (
          <div className="mt-3 sm:mt-0 flex items-center gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.round(event.organizer.ratingsAvg)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }
              />
            ))}
            <span className="text-sm font-semibold ml-1">
              {event.organizer.ratingsAvg.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      {event.promotions.length > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
            <Tag size={18} className="text-green-500" />
            Promo Tersedia
          </h3>
          <ul className="space-y-2">
            {event.promotions.map((promo) => (
              <li
                key={promo.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-green-800 bg-gray-900/60 px-4 py-3 text-sm text-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Badge color="success">{promo.code}</Badge>
                  <span>
                    {promo.type === "PERCENT"
                      ? `${promo.value}%`
                      : formatCurrencyIDR(promo.value)}{" "}
                    potongan
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 sm:mt-0">
                  <Ticket size={14} className="text-green-400" />
                  <Tooltip
                    content={`Berlaku sampai ${new Date(
                      promo.endsAt
                    ).toLocaleDateString("id-ID")}`}
                  >
                    <span className="font-mono">
                      {new Date(promo.startsAt).toLocaleDateString("id-ID")} –{" "}
                      {new Date(promo.endsAt).toLocaleDateString("id-ID")}
                    </span>
                  </Tooltip>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Event, Attendee } from '@/interfaces/event.interface';
import axios from "axios";

export default function AttendeeList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/events`,
            { withCredentials: true }
          );
        if (response.status !== 200) throw new Error('Failed to fetch events');
        const data = response.data;
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    };
    fetchEvents();
  }, []);

  // Fetch attendees when event is selected
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchAttendees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/attendees/${selectedEventId}`,
          { withCredentials: true } 
        );
        if (response.status !== 200) throw new Error('Failed to fetch attendees');
        const data = response.data;
        setAttendees(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendees');
        setAttendees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendees();
  }, [selectedEventId]);

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Attendee List</h2>
      
      {/* Event Selection Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose an event...</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Attendees Table */}
      {isLoading ? (
        <div className="text-center py-4">Loading attendees...</div>
      ) : attendees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Paid
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <tr key={attendee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendee.user.first_name} {attendee.user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendee.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${attendee.total_amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedEventId && <p className="text-gray-500">No attendees found for this event.</p>
      )}
    </div>
  );
}
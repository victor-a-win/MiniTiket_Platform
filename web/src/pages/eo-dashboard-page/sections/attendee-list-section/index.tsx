"use client";

import { useState, useEffect } from 'react';
import { Event } from '@/interfaces/event.interface';
import axios from "axios";
import { useAuth } from '@/hooks/useAuth';

export const dynamic = 'force-dynamic';

interface Attendee {
  id: string;
  quantity: number;
  total_amount: number;
  user: {
    first_name: string;
    last_name: string;
  };
}

export default function AttendeeList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { token } = useAuth();

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch organizer's events
  useEffect(() => {
    if (!isClient || !token) return;

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/events`,
          { 
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        
        console.log('Events API Response:', response.data);
        
        const eventsData = response.data.data || response.data;
        
        if (!Array.isArray(eventsData)) {
          console.error('Expected array but got:', typeof eventsData, eventsData);
          setEvents([]);
          return;
        }

        const transformedEvents: Event[] = eventsData.map((event: any) => ({
          id: event.id,
          name: event.title || event.name || 'Untitled Event',
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          start_date: event.startAt || event.start_date,
          end_date: event.endAt || event.end_date,
          startAt: event.startAt,
          endAt: event.endAt,
          isPaid: event.isPaid,
          capacity: event.capacity,
          seats: event.seatsAvailable || event.capacity,
          seatsAvailable: event.seatsAvailable,
          price: 0,
          image_url: event.coverImageUrl,
          organizerId: event.organizerId,
          ticketTypes: event.ticketTypes || [],
          promotions: event.promotions || [],
          reviews: event.reviews || []
        }));

        setEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setEvents([]);
      }
    };
    
    fetchEvents();
  }, [token, isClient]);

  // Fetch attendees when event is selected
  useEffect(() => {
    if (!isClient || !selectedEventId || !token) return;

    const fetchAttendees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/transactions/manage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        
        console.log('Transactions response:', response.data);
        
        const transactions = response.data.data || response.data || [];
        const eventTransactions = transactions.filter((tx: any) => 
          tx.eventId === selectedEventId && tx.status === 'DONE'
        );

        const attendeesData: Attendee[] = eventTransactions.map((tx: any) => ({
          id: tx.id,
          quantity: tx.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0,
          total_amount: tx.totalPayableIDR || 0,
          user: {
            first_name: tx.user?.first_name || 'Unknown',
            last_name: tx.user?.last_name || 'User'
          }
        }));

        setAttendees(attendeesData);
        setError('');
      } catch (err) {
        console.error('Error fetching attendees:', err);
        setError(err instanceof Error ? err.message : 'Failed to load attendees');
        setAttendees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendees();
  }, [selectedEventId, token, isClient]);

  // Show loading during SSR
  if (!isClient) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Attendee List</h2>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

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
              {event.title || event.name}
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
                    Rp {attendee.total_amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedEventId && !isLoading && <p className="text-gray-500">No attendees found for this event.</p>
      )}
    </div>
  );
}
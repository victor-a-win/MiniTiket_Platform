"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Event, OrganizerEvent } from "@/interfaces/event.interface";
import { Button } from "@/components/ui/button";
import EventFormModal from "./event-form-modal";
import { PencilIcon, TrashIcon, CalendarDays, MapPin, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrencyIDR } from "@/utils/formatter";

export default function EventManagement() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
  const fetchEvents = async () => {
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    console.log("Fetching events with token:", token);
    
    // Use the correct endpoint
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/events`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("Events fetched:", response.data);

    // Handle the response structure
    const eventsData = response.data.data || response.data;
    
    setEvents(Array.isArray(eventsData) ? eventsData : []);
    setError(null);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    setError(error.response?.data?.error || error.response?.data?.message || "Failed to load events");
  } finally {
    setIsLoading(false);
  }
};
    fetchEvents();
  }, [token]);

  const handleEdit = (event: OrganizerEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

const handleDelete = async (eventId: string) => {
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: any) {
      console.error("Error deleting event:", error);
      // Show the actual error message from backend
      const errorMessage = error.response?.data?.error || "Failed to delete event";
      alert(`Error: ${errorMessage}`);
    }
  }
};

  const handleUpdateSuccess = (updatedEvent: OrganizerEvent) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      // Add new event
      setEvents(prev => [updatedEvent, ...prev]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading events...</div>;
  }

  return (
    <div className="event-management-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Events</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Create New Event
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        existingEvent={selectedEvent}
        onSuccess={handleUpdateSuccess}
      />

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-lg">No events found.</p>
            <p className="text-sm">Create your first event to get started!</p>
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {event.description || "No description provided"}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      <span>{formatDate(event.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>{event.seatsAvailable}/{event.capacity} seats available</span>
                    </div>
                  </div>

                  {event.ticketTypes && event.ticketTypes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Ticket Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.ticketTypes.map((ticket, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {ticket.name}: {formatCurrencyIDR(ticket.priceIDR)}
                            {ticket.quota && ` (${ticket.quota} available)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
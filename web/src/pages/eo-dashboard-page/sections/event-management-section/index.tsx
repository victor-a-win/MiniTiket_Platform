"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Event } from "@/interfaces/event.interface";
import { Button } from "@/components/ui/button";
import EventFormModal from "./event-form-modal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/events`,
        { withCredentials: true } 
      );
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch events when the component mounts
     fetchEvents();
  }, []);

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/${eventId}`,
           { withCredentials: true }  
      );
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleUpdateSuccess = (updatedEvent: Event) => {
    setEvents(prev =>
      prev.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    );
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }
  return (
    <div className="event-management-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Events</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Create New Event
        </Button>
      </div>

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
          <div className="text-center py-8 text-gray-500">
            No events found. Create your first event!
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{event.name}</h3>
                <p className="text-sm text-gray-600">
                  {event.location} • {event.category}
                </p>
              </div>
              
              <div className="flex gap-2">
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
          ))
        )}
      </div>
    </div>
  );
}
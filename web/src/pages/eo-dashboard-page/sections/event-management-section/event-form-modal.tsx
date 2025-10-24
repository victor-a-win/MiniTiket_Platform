"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { OrganizerEvent, CreateEventPayload, EventFormModalProps } from "@/interfaces/event.interface";
import { PlusIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function EventFormModal({
  isOpen,
  onClose,
  existingEvent,
  onSuccess
}: EventFormModalProps) {
  const { token } = useAuth();
  const [form, setForm] = useState<CreateEventPayload>({
    title: "",
    category: "",
    location: "",
    capacity: 0,
    description: "",
    isPaid: false,
    startAt: "",
    endAt: "",
    ticketTypes: [{ name: "Regular", priceIDR: 0 }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingEvent) {
      // Transform existing OrganizerEvent to CreateEventPayload format
      setForm({
        title: existingEvent.title || "",
        category: existingEvent.category || "",
        location: existingEvent.location || "",
        capacity: existingEvent.capacity || 0,
        description: existingEvent.description || "",
        isPaid: existingEvent.isPaid || false,
        startAt: existingEvent.startAt || "",
        endAt: existingEvent.endAt || "",
        ticketTypes: existingEvent.ticketTypes?.map(ticket => ({
          name: ticket.name,
          priceIDR: ticket.priceIDR,
          quota: ticket.quota === null ? undefined : ticket.quota
        })) || [{
          name: "Regular",
          priceIDR: 0,
          quota: existingEvent.capacity || undefined
        }]
      });
    } else {
      // Reset form for new event
      setForm({
        title: "",
        category: "",
        location: "",
        capacity: 0,
        description: "",
        isPaid: false,
        startAt: "",
        endAt: "",
        ticketTypes: [{ name: "Regular", priceIDR: 0 }]
      });
    }
    setError(null);
  }, [existingEvent, isOpen]);

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Ticket type handlers
  const addTicketType = () => {
    setForm(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "", priceIDR: 0 }]
    }));
  };

  const removeTicketType = (index: number) => {
    if (form.ticketTypes.length > 1) {
      setForm(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) {
    setError("No authentication token found");
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    // Validate required fields
    if (!form.title || !form.location || !form.startAt || !form.endAt || form.capacity <= 0) {
      throw new Error("Please fill in all required fields");
    }

    if (new Date(form.endAt) <= new Date(form.startAt)) {
      throw new Error("End date must be after start date");
    }

    // Validate ticket types for paid events
    if (form.isPaid) {
      for (const ticket of form.ticketTypes) {
        if (!ticket.name || ticket.priceIDR < 0) {
          throw new Error("Please fill in all ticket type fields correctly");
        }
      }
    }

    const url = existingEvent 
      ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/${existingEvent.id}`
      : `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events`;

    const method = existingEvent ? 'put' : 'post';
    
    console.log("Sending event data:", form);

    const response = await axios[method](url, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Event created/updated successfully:", response.data);
    
    // Transform the response to OrganizerEvent format
    const organizerEvent: OrganizerEvent = {
      id: response.data.id,
      title: response.data.title || response.data.name,
      description: response.data.description,
      category: response.data.category,
      location: response.data.location,
      startAt: response.data.startAt || response.data.start_date,
      endAt: response.data.endAt || response.data.end_date,
      isPaid: response.data.isPaid,
      capacity: response.data.capacity,
      seatsAvailable: response.data.seatsAvailable || response.data.capacity,
      ticketTypes: response.data.ticketTypes || [],
      promotions: response.data.promotions || []
    };

    onSuccess(organizerEvent);
    onClose();
  } catch (error: any) {
    console.error("Error saving event:", error);
    
    // Enhanced error handling
    if (error.response?.data?.details) {
      // Zod validation errors
      const validationErrors = error.response.data.details
        .map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      setError(`Validation failed: ${validationErrors}`);
    } else if (error.response?.data?.error) {
      // Backend error message
      setError(error.response.data.error);
    } else if (error.message) {
      // Frontend error
      setError(error.message);
    } else {
      setError("Failed to save event");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date & Time *</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={formatDateForInput(form.startAt)}
                onChange={(e) => setForm(prev => ({ ...prev, startAt: new Date(e.target.value).toISOString() }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endAt">End Date & Time *</Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={formatDateForInput(form.endAt)}
                onChange={(e) => setForm(prev => ({ ...prev, endAt: new Date(e.target.value).toISOString() }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                required
                placeholder="Event location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Music, Sports, Conference"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe your event..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={form.isPaid}
              onChange={(e) => setForm(prev => ({ ...prev, isPaid: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isPaid">Paid Event</Label>
          </div>

          {form.isPaid && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Ticket Types</Label>
                <Button type="button" onClick={addTicketType} size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Ticket Type
                </Button>
              </div>
              
              {form.ticketTypes.map((ticket, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded">
                  <div className="col-span-4">
                    <Label>Name</Label>
                    <Input
                      value={ticket.name}
                      onChange={(e) => updateTicketType(index, "name", e.target.value)}
                      placeholder="Ticket name"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Price (IDR)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={ticket.priceIDR}
                      onChange={(e) => updateTicketType(index, "priceIDR", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Quota (Optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={ticket.quota || ""}
                      onChange={(e) => updateTicketType(index, "quota", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="col-span-2">
                    {form.ticketTypes.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
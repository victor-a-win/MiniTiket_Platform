"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Event, EventFormModalProps } from "@/interfaces/event.interface";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function EventFormModal({
  isOpen,
  onClose,
  existingEvent,
  onSuccess
}: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    name: "",
    location: "",
    start_date: "",
    end_date: "",
    seats: 0,
    price: 0,
    description: "",
    category: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        ...existingEvent,
      });
    }
  }, [existingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = existingEvent 
      ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/${existingEvent.id}`
      : `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events`;

      const method = existingEvent ? 'put' : 'post';
      
      // Convert date-only strings to full ISO datetimes
      const payload = {
        ...formData,
        start_date: `${formData.start_date}T00:00:00.000Z`, // Add time
        end_date: `${formData.end_date}T23:59:59.999Z`,     // Add time
        seats: Number(formData.seats),
        price: Number(formData.price),
        image_url: formData.image_url || null // Handle null explicitly
    };

      const response = await axios[method](url, payload,{
        withCredentials: true
      });

      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
    setIsSubmitting(false)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seats">Available Seats</Label>
              <Input
                id="seats"
                type="number"
                value={formData.seats as number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, seats: Number(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Ticket Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price as number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price: Number(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description as string}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-2" />
                {existingEvent ? "Update Event" : "Create Event"}
              </>
            )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface Event {
  id: string;
  title: string;
  name?: string;
  price?: number; // Make optional
  start_date: string;
  end_date: string;
  location: string;
  seats: number;
  capacity: number;
  category: string;
  image_url?: string;
  description: string;
  user?: { first_name: string; last_name: string };
  created_at?: string;
  user_id?: string;
  organizer?: string;
  vouchers?: string;
  // New fields for compatibility
  startAt?: string;
  endAt?: string;
  seatsAvailable?: number;
  isPaid?: boolean;
  coverImageUrl?: string | null;
  organizerId?: string;
  promotions?: any[];
  reviews?: any[];
  ticketTypes?: EventTicketType[]; // Use proper type
}

export interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  capacity: number;
  seatsAvailable: number;
  coverImageUrl: string | null;
  organizerId: string; // This must be required
  organizer: {
    displayName: string;
    ratingsAvg: number;
    userId?: string;
    user?: {
      email: string;
    };
  };
  ticketTypes: EventTicketType[];
  promotions: any[];
  reviews: any[];
  // Include old properties for backward compatibility
  name?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  seats?: number;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  category?: string;
  location: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  capacity: number;
  ticketTypes: Array<{
    name: string;
    priceIDR: number;
    quota?: number;
  }>;
}

export interface OrganizerEvent {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  capacity: number;
  seatsAvailable: number;
  ticketTypes: EventTicketType[];
  promotions: any[];
  // Add old Event interface properties for compatibility
  name?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  seats?: number;
  image_url?: string;
  user?: { first_name: string; last_name: string };
  created_at?: string;
  user_id?: string;
  organizer?: string;
  vouchers?: string;
}

export interface EventTicketType {
  id: string;
  name: string;
  priceIDR: number;
  quota: number | null;
}

export interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingEvent?: OrganizerEvent | null;
  onSuccess: (event: OrganizerEvent) => void;
}

export interface StatisticsData {
  period: string;
  event_count: number;
  tickets_sold: number;
  total_revenue: number;
}

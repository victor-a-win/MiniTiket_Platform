import { apiClient, extractApiError } from "./api-client";

export interface EventTicketType {
  id: string;
  name: string;
  priceIDR: number;
  quota: number | null;
}

export interface EventPromotion {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT" | string;
  value: number;
  minSpendIDR: number;
  startsAt: string;
  endsAt: string;
}

export interface EventReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface EventOrganizerSummary {
  displayName: string;
  ratingsAvg: number;
}

export interface EventSummary {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  coverImageUrl: string | null;
  capacity: number;
  seatsAvailable: number;
  organizer: EventOrganizerSummary;
  ticketTypes: EventTicketType[];
  promotions: EventPromotion[];
  reviews: EventReview[];
}

export interface EventListResponse {
  data: EventSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EventDetailOrganizer extends EventOrganizerSummary {
  userId: string;
  user: {
    email: string;
  };
}

export interface EventDetail extends EventSummary {
  organizerId: string;
  organizer: EventDetailOrganizer;
  promotions: EventPromotion[];
  reviews: EventReview[];
}

export interface EventListParams {
  search?: string;
  category?: string;
  location?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OrganizerEvent
  extends Pick<
    EventDetail,
    | "id"
    | "title"
    | "description"
    | "category"
    | "location"
    | "startAt"
    | "endAt"
    | "isPaid"
    | "capacity"
    | "seatsAvailable"
    | "ticketTypes"
    | "promotions"
  > {}

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

export async function fetchEvents(
  params: EventListParams = {}
): Promise<EventListResponse> {
  try {
    const response = await apiClient.get<EventListResponse>("/events", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchEventDetail(id: string): Promise<EventDetail> {
  try {
    const response = await apiClient.get<EventDetail>(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function createEvent(payload: CreateEventPayload, token: string) {
  try {
    const response = await apiClient.post("/events", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function updateEvent(
  id: string,
  payload: Partial<CreateEventPayload>,
  token: string
) {
  try {
    const response = await apiClient.put(`/events/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

export async function fetchOrganizerEvents(token: string) {
  try {
    const response = await apiClient.get<{ data: OrganizerEvent[] }>(
      "/events/mine",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error));
  }
}

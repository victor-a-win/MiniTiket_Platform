import { Event } from "@/interfaces/event.interface";
import axios from "axios";

export const fetchEvents = async (params?: {
  category?: string;
  location?: string;
  search?: string;
}) => {
  try {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events`, { params });
  return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  } 
};

export const fetchEventDetails = async (id: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/${id}`);
  return response.data;
};

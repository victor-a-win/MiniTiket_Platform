import axios from "axios";

const API_URL = process.env.API_URL || 'http://localhost:8000'; // Sesuaikan dengan port BE Anda

export const fetchEvents = async (params?: {
  category?: string;
  location?: string;
  search?: string;
}) => {
  try {
  const response = await axios.get(`${API_URL}/events`, { params });
  return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  } 
};

export const fetchEventDetails = async (id: string) => {
  const response = await axios.get(`${API_URL}/events/${id}`);
  return response.data;
};
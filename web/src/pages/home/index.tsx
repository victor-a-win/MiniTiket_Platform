import React from 'react';
import { fetchEvents, fetchEventDetails } from './api';

// Example usage in a React component
export default function HomePage() {
  // Example: Fetch events when component mounts
  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await fetchEvents({
          category: 'music',
          location: 'jakarta'
        });
        console.log('Events:', events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    loadEvents();
  }, []);

  // Example: Fetch specific event details
  const handleEventClick = async (eventId: string) => {
    try {
      const eventDetails = await fetchEventDetails(eventId);
      console.log('Event details:', eventDetails);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      {/* Your component JSX */}
    </div>
  );
}
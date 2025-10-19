"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatisticsData } from '@/interfaces/event.interface';
import axios from 'axios';

export default function SimpleBarChart() {
  const [data, setData] = useState<StatisticsData[]>([]);
  const [groupBy, setGroupBy] = useState<'year' | 'month' | 'day'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/statistics?groupBy=${groupBy}`,
            {withCredentials: true}
        );
        
        if (response.status < 200 || response.status >= 300) throw new Error('Failed to fetch statistics');
        const result = response.data;
        setData(result);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [groupBy]);

  const formatTick = (period: string) => {
    if (groupBy === 'year') return period;
    if (groupBy === 'month') return period.slice(0, 7);
    return period;
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'total_revenue') return `$${value.toFixed(2)}`;
    return value;
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Event Statistics</h2>
      
      <div className="mb-6">
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
          className="p-2 border rounded-md"
        >
          <option value="year">Yearly</option>
          <option value="month">Monthly</option>
          <option value="day">Daily</option>
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <div className="text-center py-4">Loading statistics...</div>
      ) : data.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={formatTick}
                angle={-45}
                textAnchor="end"
                height={85}
              />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="event_count" name="Events Created" fill="#8884d8" />
              <Bar dataKey="tickets_sold" name="Tickets Sold" fill="#82ca9d" />
              <Bar dataKey="total_revenue" name="Total Revenue (IDR)" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500">No statistics available for this period.</p>
      )}
    </div>
  );
}
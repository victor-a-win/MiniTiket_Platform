"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { StatisticsData } from '@/interfaces/event.interface';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function SimpleBarChart() {
  const [data, setData] = useState<StatisticsData[]>([]);
  const [groupBy, setGroupBy] = useState<'year' | 'month' | 'day'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/events/organizer/statistics?groupBy=${groupBy}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );
        
        if (response.status < 200 || response.status >= 300) throw new Error('Failed to fetch statistics');
        const result = response.data;
        setData(result);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchStatistics();
    }
  }, [groupBy, token]);

  const formatTick = (period: string) => {
    if (groupBy === 'year') return period;
    if (groupBy === 'month') {
      // Format as "Jan 2024", "Feb 2024", etc.
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    // For daily, show as "Jan 1", "Jan 2", etc.
    const date = new Date(period);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}Rb`;
    }
    return `Rp ${value}`;
  };

  const formatCount = (value: number) => {
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{formatTick(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'total_revenue' 
                  ? formatRevenue(entry.value)
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate max values for better axis scaling
  const maxEventCount = Math.max(...data.map(item => item.event_count || 0));
  const maxTicketsSold = Math.max(...data.map(item => item.tickets_sold || 0));
  const maxRevenue = Math.max(...data.map(item => item.total_revenue || 0));

  const leftAxisMax = Math.max(maxEventCount, maxTicketsSold) * 1.1; // 10% padding
  const rightAxisMax = maxRevenue * 1.1;

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Event Statistics</h2>
      
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="groupBy" className="text-sm font-medium text-gray-700">
          Group by:
        </label>
        <select
          id="groupBy"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="year">Yearly</option>
          <option value="month">Monthly</option>
          <option value="day">Daily</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading statistics...</p>
        </div>
      ) : data.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              
              {/* X Axis */}
              <XAxis
                dataKey="period"
                tickFormatter={formatTick}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              
              {/* Left Y Axis - for Event Count and Tickets Sold */}
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={formatCount}
                domain={[0, leftAxisMax]}
                label={{ 
                  value: 'Event Count & Tickets Sold', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -10,
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: 12 }}
              />
              
              {/* Right Y Axis - for Revenue */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatRevenue}
                domain={[0, rightAxisMax]}
                label={{ 
                  value: 'Total Revenue (IDR)', 
                  angle: 90, 
                  position: 'insideRight',
                  offset: -10,
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fontSize: 12 }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              {/* Bars for Event Count and Tickets Sold */}
              <Bar
                yAxisId="left"
                dataKey="event_count"
                name="Events Created"
                fill="#8884d8"
                radius={[2, 2, 0, 0]}
                barSize={20}
              />
              <Bar
                yAxisId="left"
                dataKey="tickets_sold"
                name="Tickets Sold"
                fill="#82ca9d"
                radius={[2, 2, 0, 0]}
                barSize={20}
              />
              
              {/* Line for Revenue - uses right Y axis */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total_revenue"
                name="Total Revenue (IDR)"
                stroke="#ff7300"
                strokeWidth={3}
                dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ff7300' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No statistics available for this period.</p>
          <p className="text-gray-400 text-sm mt-2">
            Data will appear here once you create events and make sales.
          </p>
        </div>
      )}
    </div>
  );
}
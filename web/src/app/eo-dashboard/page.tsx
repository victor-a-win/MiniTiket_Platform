"use client";

import dynamic from 'next/dynamic';

const EODashboard = dynamic(() => import('@/pages/eo-dashboard-page'), {
  ssr: false,
});

export default function EODashboardPage() {
  return <EODashboard />;
}
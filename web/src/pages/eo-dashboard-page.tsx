import dynamic from 'next/dynamic';

const EODashboard: any = dynamic(() => import('./eo-dashboard-page'), {
  ssr: false,
});

export default EODashboard;
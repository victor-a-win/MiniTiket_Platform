import SimpleBarChart from "@/components/basic-statistics/basic-statistics";

// Add this to disable static generation
export const dynamic = 'force-dynamic';

export default function BasicStatistics() {
    return (
      <div>
        < SimpleBarChart />
      </div>
    );
  }
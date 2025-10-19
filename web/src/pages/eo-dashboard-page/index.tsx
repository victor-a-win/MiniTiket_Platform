"use client";

import { useAppSelector } from "@/lib/redux/hook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BasicStatistics from "./sections/statistics-section";
import TransactionManagement from "./sections/transaction-management-section";
import EventManagement from "./sections/event-management-section";
import AttendeeList from "./sections/attendee-list-section";

import "./eo_dashboard.style.css"

export default function EODashboard() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Only check auth state if we're running on client
    if (typeof window !== 'undefined') {
      if (!auth.isLogin) {
        router.push('/login');
      } else if (auth.user?.roleName?.toLowerCase() !== 'event organizer') {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [auth, router]);

  console.log("Auth state:", auth); // Debugging line

  // Show loading state while checking authentication
  if (isLoading || !auth.isLogin || auth.user?.roleName?.toLowerCase() !== 'event organizer'
  ) {
    return <div className="flex justify-center items-center h-screen">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500">
        </div>
      </div>;
  }

  return ( 
    <div className="EO-Dashboard-Styles p-6">
      <h1 className="text-3xl font-bold"
        > Welcome, {auth.user.first_name} 
      </h1>

      <div className="text-base mt-4"> 
        <p>
          This is your Event Organizer dashboard. 
          Here you can manage your events, view statistics, and more.
        </p>
      </div>
      
      <div className="mt-8">
          < EventManagement />
      </div>
      <div className="mt-8">
          < BasicStatistics />
      </div>
      <div className="mt-8">
          < TransactionManagement />
      </div>
      <div className="mt-8"> 
          < AttendeeList />
      </div>
    </div>
  );
}
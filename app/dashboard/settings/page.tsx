'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { checkUserSession, UserSessionResult } from '@/app/_lib/auth'; // Updated import

interface Booking {
  id: string;
  // Add other booking properties here
}

interface Activity {
  id: string;
  // Add other activity properties here
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings] = useState<Booking[]>([]);
  const [activities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const result: UserSessionResult = await checkUserSession();
      if (result.user) {
        setUser(result.user);
        // Here you would fetch bookings and activities from your backend
        // const fetchedBookings = await fetchBookings(result.user.id);
        // const fetchedActivities = await fetchActivities(result.user.id);
        // setBookings(fetchedBookings);
        // setActivities(fetchedActivities);
      } else {
        console.error('No user session found');
        // Handle the case where there's no user session (e.g., redirect to login)
      }
    };
    fetchUserData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Booking Status</h2>
        {bookings.length === 0 ? (
          <p>No current bookings.</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li key={booking.id}>{/* Render booking information */}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        {activities.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity.id}>{/* Render activity information */}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { checkUserSession, UserSessionResult, ExtendedUser } from '@/app/_lib/auth';
import { supabase } from '@/app/_lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Booking {
  id: string;
  user_id: string;
  // Add other relevant fields
}

interface Activity {
  id: string;
  user_id: string;
  // Add other relevant fields
}

export default function BookingPage() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result: UserSessionResult = await checkUserSession();
        if (result.user) {
          setUser(result.user);
          await Promise.all([
            fetchBookings(result.user.id),
            fetchActivities(result.user.id)
          ]);
        } else {
          console.error('No user session found');
          // Handle the case where there's no user session (e.g., redirect to login)
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle the error (e.g., show an error message to the user)
      }
    };

    fetchUserData();

    // Set up real-time subscriptions
    let bookingsSubscription: RealtimeChannel | null = null;
    let activitiesSubscription: RealtimeChannel | null = null;

    if (user) {
      bookingsSubscription = supabase
        .channel('bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
          console.log('Booking change received!', payload);
          fetchBookings(user.id);
        })
        .subscribe();

      activitiesSubscription = supabase
        .channel('activities')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, payload => {
          console.log('Activity change received!', payload);
          fetchActivities(user.id);
        })
        .subscribe();
    }

    return () => {
      if (bookingsSubscription) bookingsSubscription.unsubscribe();
      if (activitiesSubscription) activitiesSubscription.unsubscribe();
    };
  }, [user]); // Add user as a dependency

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const fetchActivities = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 font-sans" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8 text-teal-800">Booking</h1>
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-700">Booking Status</h2>
          {bookings.length === 0 ? (
            <p>No current bookings.</p>
          ) : (
            <ul>
              {bookings.map((booking) => (
                <li key={booking.id}>
                  {/* Render booking information safely */}
                  Booking ID: {booking.id}
                  {/* Add more booking details as needed */}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-teal-700">Recent Activity</h2>
          {activities.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <ul>
              {activities.map((activity) => (
                <li key={activity.id}>
                  {/* Render activity information safely */}
                  Activity ID: {activity.id}
                  {/* Add more activity details as needed */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { checkUserSession, UserSessionResult, ExtendedUser } from '@/app/_lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result: UserSessionResult = await checkUserSession();
        if (result.error || !result.user) throw new Error(result.error || 'User not found');
        console.log('AdminDashboard checkUserSession result:', result);
        setUser(result.user);
        setIsAdmin(result.isAdmin);
        if (!result.user || !result.isAdmin) {
          setError('Unauthorized access');
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user || !isAdmin) {
    return <div>Access denied. You must be an admin to view this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <p>User ID: {user.id}</p>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
      {/* Rest of your dashboard content */}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserSession, UserSessionResult } from '@/app/_lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        console.log('Checking admin status...');
        const result: UserSessionResult = await checkUserSession();
        console.log('User session result:', { userId: result.user?.id, isAdmin: result.isAdmin });
        
        if (result.error || !result.user) {
          console.log('User is not logged in');
          setError(result.error || 'User is not logged in');
          setIsAdmin(false);
          router.push('/signin');
          return;
        }

        if (result.isAdmin) {
          console.log('User is admin');
          setIsAdmin(true);
        } else {
          console.log('User is not admin');
          setError(`User (${result.user.id}) is not an admin. Please check the admin_users table.`);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Unexpected error checking admin status:', error);
        setError(`Unexpected error: ${error}`);
        setIsAdmin(false);
      }
    }
    checkAdminStatus();
  }, [router]);

  if (isAdmin === null) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return isAdmin ? <>{children}</> : null;
}
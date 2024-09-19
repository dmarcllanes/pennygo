import Link from 'next/link';
import { useEffect, useState } from 'react';
import { checkUserSession } from '@/app/_lib/auth';

export function AdminNavigation() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await checkUserSession();
        setIsAdmin(user?.isAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Or redirect to a non-admin page
  }

  return (
    <nav>
      <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
        Dashboard
      </Link>
      <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 mr-4">
        Manage Users
      </Link>
      <Link href="/admin/settings" className="text-blue-600 hover:text-blue-800">
        Settings
      </Link>
    </nav>
  );
}
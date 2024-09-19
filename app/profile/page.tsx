'use client';

import { useEffect, useState } from 'react';
import { checkUserSession } from '@/app/_lib/auth';
import Link from 'next/link';

export default function ProfilePage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const user = await checkUserSession();
      setIsAdmin(user?.isAdmin || false);
    }
    checkAdmin();
  }, []);

  return (
    <div>
      {/* User profile information */}
      {isAdmin && (
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}
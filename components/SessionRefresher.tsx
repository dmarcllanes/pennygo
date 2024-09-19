'use client';

import { useEffect } from 'react';
import { checkUserSession } from '@/app/_lib/auth';

export default function SessionRefresher() {
  useEffect(() => {
    const refreshSession = async () => {
      await checkUserSession();
    };

    refreshSession();

    // Refresh session every 30 minutes
    const intervalId = setInterval(refreshSession, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
'use client';

import React from 'react';
import { signOut } from '@/app/_lib/auth';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut();
      // Optionally, you can add a success message or redirect here
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, you can show an error message to the user
    }
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
      Logout
    </button>
  );
}
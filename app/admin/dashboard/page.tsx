'use client';

import { AdminProtected } from '../AdminProtected';
import AdminDashboard from './AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <AdminProtected>
      <AdminDashboard />
    </AdminProtected>
  );
}
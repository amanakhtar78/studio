
'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
// Removed Button, logoutAdmin, useRouter, LogOut, LayoutDashboard as they are handled by AdminSidebar/AdminLayout

export default function AdminDashboardPage() {
  const { adminUser } = useSelector((state: RootState) => state.adminAuth);

  return (
    <div className="bg-background text-foreground">
      {/* Main Content Area */}
      <section className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          This is the admin dashboard. Future content and management tools will be displayed here.
          Welcome to the Zahra Sweet Rolls Admin Panel.
        </p>
        {adminUser && (
          <div className="mt-6 p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium text-foreground mb-1">Current Admin User Details:</h3>
            <ul className="text-sm text-muted-foreground space-y-0.5">
              <li><strong>User Code:</strong> {adminUser.userCode}</li>
              <li><strong>Email:</strong> {adminUser.emailId}</li>
              <li><strong>Role/Module:</strong> {adminUser.traineeOrTrainer}</li>
              <li><strong>User Type (Is Staff/Superuser etc.):</strong> {adminUser.userType ? 'Staff/Admin' : 'Regular'}</li>
            </ul>
          </div>
        )}
      </section>
      {/* Further dashboard sections can be added here */}
    </div>
  );
}

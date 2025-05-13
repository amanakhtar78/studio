
'use client';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { Button } from '@/components/ui/button';
import { logoutAdmin } from '@/store/slices/adminAuthSlice';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { adminUser } = useSelector((state: RootState) => state.adminAuth);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Navbar Placeholder */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          {adminUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden md:inline">Welcome, {adminUser.userCode} ({adminUser.emailId})</span>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 md:p-6">
        <section className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            This is the admin dashboard. Future content and management tools will be displayed here.
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
      </main>
    </div>
  );
}

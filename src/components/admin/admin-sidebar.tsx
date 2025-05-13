
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ImageIcon, LogOut, UserCircle } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar'; 
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { logoutAdmin } from '@/store/slices/adminAuthSlice';
import { useRouter } from 'next/navigation';


export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { adminUser } = useSelector((state: RootState) => state.adminAuth);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/product-images', label: 'Product Images', icon: ImageIcon },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <SweetRollsLogo />
          {state === 'expanded' && <span className="font-semibold text-lg text-primary">Admin Panel</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={state === 'collapsed' ? item.label : undefined}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  {state === 'expanded' && <span>{item.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t">
        {state === 'expanded' && adminUser && (
          <div className="flex flex-col items-start text-xs text-muted-foreground mb-2">
             <div className="flex items-center gap-2 mb-1">
                <UserCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{adminUser.userCode}</span>
             </div>
            <span>{adminUser.emailId}</span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-center">
          <LogOut className="h-4 w-4" />
          {state === 'expanded' && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

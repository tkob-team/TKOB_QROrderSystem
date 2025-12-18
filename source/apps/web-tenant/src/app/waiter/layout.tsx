'use client';

import { useRouter } from 'next/navigation';
import { WaiterLayout } from '@/shared/components/layout/WaiterLayout';

export default function WaiterLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    // Map screen IDs to routes
    const routes: Record<string, string> = {
      'service-board': '/waiter/service-board',
      'account-settings': '/admin/account-settings',
      'login': '/auth/login',
    };

    const route = routes[screen];
    if (route) {
      router.push(route);
    }
  };

  return (
    <WaiterLayout 
      restaurantName="TKOB Restaurant"
      userName="Waiter User"
      userRole="Waiter"
      avatarColor="blue"
      onNavigate={handleNavigate}
    >
      {children}
    </WaiterLayout>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  
  useEffect(() => {
    // Add delay to prevent race condition with token loading
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log('Unauthorized role, redirecting');
        router.push('/unauthorized');
      } else {
        setIsChecking(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, allowedRoles, router]);
  
  if (isChecking || !isAuthenticated) {
    return <Loading fullScreen text="Loading..." />;
  }
  
  return <>{children}</>;
}

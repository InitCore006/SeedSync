'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Package,
  TrendingUp,
  Warehouse,
  ShoppingCart,
  BarChart3,
  CheckSquare,
  Link as LinkIcon,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/authStore';
import { USER_ROLES } from '@/lib/constants';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [

  // FPO specific
   {
    label: 'Dashboard',
    href: '/fpo/dashboard',
    icon: <Home className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  {
    label: 'Members',
    href: '/fpo/members',
    icon: <Users className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  {
    label: 'Procurement',
    href: '/fpo/procurement',
    icon: <Package className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  {
    label: 'Warehouse',
    href: '/fpo/warehouse',
    icon: <Warehouse className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  {
    label: 'Bids',
    href: '/fpo/bids',
    icon: <TrendingUp className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: [USER_ROLES.FPO],
  },
  
  // Processor specific

  {
    label: 'Dashboard',
    href: '/processor/dashboard',
    icon: <Home className="h-5 w-5" />,
    roles: [USER_ROLES.PROCESSOR],
  },
  {
    label: 'Procurement',
    href: '/processor/procurement',
    icon: <Package className="h-5 w-5" />,
    roles: [USER_ROLES.PROCESSOR],
  },
  {
    label: 'Processing Batches',
    href: '/processor/batches',
    icon: <TrendingUp className="h-5 w-5" />,
    roles: [USER_ROLES.PROCESSOR],
  },
  {
    label: 'Inventory',
    href: '/processor/inventory',
    icon: <Warehouse className="h-5 w-5" />,
    roles: [USER_ROLES.PROCESSOR],
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: [USER_ROLES.PROCESSOR],
  },
  
  // Retailer specific
   {
    label: 'Dashboard',
    href: '/retailer/dashboard',
    icon: <Home className="h-5 w-5" />,
    roles: [USER_ROLES.RETAILER],
  },
  {
    label: 'Orders',
    href: '/retailer/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: [USER_ROLES.RETAILER],
  },
  {
    label: 'Inventory',
    href: '/retailer/inventory',
    icon: <Package className="h-5 w-5" />,
    roles: [USER_ROLES.RETAILER],
  },
  {
    label: 'Suppliers',
    href: '/retailer/suppliers',
    icon: <Users className="h-5 w-5" />,
    roles: [USER_ROLES.RETAILER],
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: [USER_ROLES.RETAILER],
  },
  
  // Government specific
  {
    label: 'Dashboard',
    href: '/government/dashboard',
    icon: <Home className="h-5 w-5" />,
    roles: [USER_ROLES.GOVERNMENT],
  },
  {
    label: 'FPO Monitoring',
    href: '/government/monitoring',
    icon: <Users className="h-5 w-5" />,
    roles: [USER_ROLES.GOVERNMENT],
  },
  {
    label: 'Approvals',
    href: '/government/approvals',
    icon: <CheckCircle className="h-5 w-5" />,
    roles: [USER_ROLES.GOVERNMENT],
  },
  
  // Common
  {
    label: 'Traceability',
    href: '/trace',
    icon: <LinkIcon className="h-5 w-5" />,
    roles: [USER_ROLES.FPO, USER_ROLES.PROCESSOR, USER_ROLES.RETAILER, USER_ROLES.GOVERNMENT],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <FileText className="h-5 w-5" />,
    roles: [USER_ROLES.FPO, USER_ROLES.PROCESSOR, USER_ROLES.RETAILER, USER_ROLES.GOVERNMENT],
  },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );
  
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-30 transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

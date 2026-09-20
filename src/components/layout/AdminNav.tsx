import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin',
    },
    {
      label: 'All Projects',
      href: '/admin/projects',
      icon: FolderKanban,
      isActive: pathname.startsWith('/admin/projects'),
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
      isActive: pathname.startsWith('/admin/users'),
    },
    {
      label: 'Clients',
      href: '/admin/clients',
      icon: Building2,
      isActive: pathname.startsWith('/admin/clients'),
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 p-1 bg-secondary/40 rounded-xl border border-border/60 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap',
              item.isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
            )}
          >
            <Icon className={cn('w-4 h-4', item.isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

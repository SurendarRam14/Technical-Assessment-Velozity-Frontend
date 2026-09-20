import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Users,
  Search,
  Filter,
  Shield,
  Briefcase,
  Code,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import { usersApi } from '@/api/users.api';
import { User, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminNav } from '@/components/layout/AdminNav';
import { UserNav } from '@/components/layout/UserNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const AdminUsersPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input by 300ms for smooth API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query users with role and search parameters using React Query
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users', { role: roleFilter, search: debouncedSearch }],
    queryFn: () =>
      usersApi.list({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: debouncedSearch || undefined,
      }),
  });

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="default" className="gap-1 font-bold text-xs">
            <Shield className="w-3 h-3" />
            <span>ADMIN</span>
          </Badge>
        );
      case 'PM':
        return (
          <Badge
            variant="secondary"
            className="gap-1 font-bold text-xs bg-amber-500/15 text-amber-400 border-amber-500/30"
          >
            <Briefcase className="w-3 h-3" />
            <span>PROJECT MANAGER</span>
          </Badge>
        );
      case 'DEVELOPER':
        return (
          <Badge
            variant="secondary"
            className="gap-1 font-bold text-xs bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
          >
            <Code className="w-3 h-3" />
            <span>DEVELOPER</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Users Directory
            </h1>
            <Badge variant="default" className="ml-2 font-bold">
              ADMIN
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserNav />
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <AdminNav />

      {/* Error state */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            {(error as any)?.response?.data?.error?.message || 'Failed to load users list.'}
          </p>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span>Platform Users</span>
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              View and filter all registered system accounts across roles
            </CardDescription>
          </div>

          {/* Filter Bar: Role Dropdown + Search Input */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}
                className="h-9 px-3 py-1 text-xs bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
              >
                <option value="ALL" className="bg-background text-foreground">
                  All Roles
                </option>
                <option value="ADMIN" className="bg-background text-foreground">
                  Admin
                </option>
                <option value="PM" className="bg-background text-foreground">
                  Project Manager
                </option>
                <option value="DEVELOPER" className="bg-background text-foreground">
                  Developer
                </option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-secondary/40 border-border/60"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <Users className="w-10 h-10 mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No users found</p>
                <p className="text-xs">
                  {searchInput || roleFilter !== 'ALL'
                    ? 'No users match your active search and role filters.'
                    : 'No users registered in the system.'}
                </p>
              </div>
              {(searchInput || roleFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput('');
                    setRoleFilter('ALL');
                  }}
                  className="text-xs mt-2"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/20 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {users.map((u) => {
                    const joinedFormatted = u.createdAt
                      ? format(new Date(u.createdAt), 'MMM dd, yyyy')
                      : '—';

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-muted/15 transition-colors"
                      >
                        {/* Name with Avatar */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/80 border border-border/80 flex items-center justify-center font-bold text-xs text-foreground shadow-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground">
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 text-xs font-mono text-muted-foreground">
                          {u.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          {getRoleBadge(u.role)}
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 sm:px-6 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span>{joinedFormatted}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

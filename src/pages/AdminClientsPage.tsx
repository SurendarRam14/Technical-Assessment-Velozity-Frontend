import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FolderKanban,
  Search,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { clientsApi } from '@/api/clients.api';
import { Client } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminNav } from '@/components/layout/AdminNav';
import { UserNav } from '@/components/layout/UserNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export const AdminClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all clients using React Query
  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  });

  // Client-side search filter
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase().trim();
    return clients.filter((c) => c.name.toLowerCase().includes(term));
  }, [clients, searchTerm]);

  const totalProjectsAcrossClients = useMemo(() => {
    return clients.reduce((sum, c) => sum + (c._count?.projects ?? c.projects?.length ?? 0), 0);
  }, [clients]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Clients
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
            {(error as any)?.response?.data?.error?.message || 'Failed to load clients list.'}
          </p>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Client Accounts</span>
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              All active client organizations and assigned project counts ({totalProjectsAcrossClients} total projects)
            </CardDescription>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-secondary/40 border-border/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <Building2 className="w-10 h-10 mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No clients found</p>
                <p className="text-xs">
                  {searchTerm
                    ? `No clients matching "${searchTerm}". Try a different search term.`
                    : 'No clients registered in the system.'}
                </p>
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="text-xs mt-2">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/20 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Client Name</th>
                    <th className="py-3.5 px-4 text-center">Active Projects</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredClients.map((client) => {
                    const projectCount = client._count?.projects ?? client.projects?.length ?? 0;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-muted/15 transition-colors group"
                      >
                        {/* Client Name */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shadow-sm flex-shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-foreground text-base">
                              {client.name}
                            </span>
                          </div>
                        </td>

                        {/* Projects Count */}
                        <td className="py-4 px-4 text-center">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs px-2.5 py-1 gap-1.5 inline-flex items-center bg-secondary/60 text-foreground"
                          >
                            <FolderKanban className="w-3.5 h-3.5 text-primary" />
                            <span>
                              {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                            </span>
                          </Badge>
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Link to={`/admin/projects`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            >
                              <span>View All Projects</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
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

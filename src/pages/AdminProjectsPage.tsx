import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  FolderKanban,
  FolderPlus,
  Building2,
  Calendar,
  CheckSquare,
  Search,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';
import { projectsApi } from '@/api/projects.api';
import { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminNav } from '@/components/layout/AdminNav';
import { UserNav } from '@/components/layout/UserNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NewProjectModal } from '@/components/projects/NewProjectModal';

export const AdminProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Fetch all projects (admin gets all projects across every PM)
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  // Client-side filtering by name, client name, or PM name
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.client?.name?.toLowerCase().includes(term) ||
        p.pm?.name?.toLowerCase().includes(term) ||
        p.pm?.email?.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  const totalTasksAcrossProjects = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p._count?.tasks ?? p.tasks?.length ?? 0), 0);
  }, [projects]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              All Projects
            </h1>
            <Badge variant="default" className="ml-2 font-bold">
              ADMIN
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsNewProjectOpen(true)}
            className="gap-1.5 shadow-lg shadow-primary/20"
            size="sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
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
            {(error as any)?.response?.data?.error?.message || 'Failed to load projects list.'}
          </p>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              <span>Projects Directory</span>
              <Badge variant="secondary" className="ml-2 font-mono text-xs">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              All client projects across every Project Manager ({totalTasksAcrossProjects} total tasks)
            </CardDescription>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by project, client, or PM..."
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <FolderKanban className="w-10 h-10 mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No projects found</p>
                <p className="text-xs">
                  {searchTerm
                    ? `No projects matching "${searchTerm}". Try a different search term.`
                    : 'No projects have been created yet.'}
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
                    <th className="py-3.5 px-4 sm:px-6">Project Name</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Owning PM</th>
                    <th className="py-3.5 px-4 text-center">Tasks</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredProjects.map((project) => {
                    const taskCount = project._count?.tasks ?? project.tasks?.length ?? 0;
                    const createdDateFormatted = project.createdAt
                      ? format(new Date(project.createdAt), 'MMM dd, yyyy')
                      : '—';

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-muted/15 transition-colors group"
                      >
                        {/* Project Name */}
                        <td className="py-4 px-4 sm:px-6">
                          <Link
                            to={`/projects/${project.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2 group-hover:translate-x-0.5 transform duration-150"
                          >
                            <FolderKanban className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{project.name}</span>
                          </Link>
                        </td>

                        {/* Client */}
                        <td className="py-4 px-4">
                          {project.client ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 text-xs font-medium bg-secondary/60 text-foreground"
                            >
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              <span>{project.client.name}</span>
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No Client</span>
                          )}
                        </td>

                        {/* Owning PM */}
                        <td className="py-4 px-4">
                          {project.pm ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">
                                {project.pm.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-xs font-medium text-foreground">
                                  {project.pm.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {project.pm.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                        </td>

                        {/* Task Count */}
                        <td className="py-4 px-4 text-center">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-0.5 gap-1 inline-flex items-center bg-secondary/30"
                          >
                            <CheckSquare className="w-3 h-3 text-cyan-400" />
                            <span>{taskCount}</span>
                          </Badge>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span>{createdDateFormatted}</span>
                          </div>
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <Link to={`/projects/${project.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            >
                              <span>Board</span>
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

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
    </div>
  );
};

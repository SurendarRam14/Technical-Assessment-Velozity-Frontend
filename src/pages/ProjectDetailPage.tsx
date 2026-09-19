import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { tasksApi, TaskFilters } from '../api/tasks.api';
import { useProjectActivity } from '../sockets/useProjectActivity';
import { FilterBar } from '../components/tasks/FilterBar';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskCard } from '../components/tasks/TaskCard';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FolderKanban,
  Building2,
  User as UserIcon,
  Calendar,
  AlertCircle,
  ShieldAlert,
  Inbox,
  LayoutGrid,
  Columns3,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { useAuth } from '../auth/AuthContext';
import { NewTaskModal } from '../components/tasks/NewTaskModal';

import { Skeleton } from '@/components/ui/skeleton';

export const ProjectDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Extract filters from URL query parameters (single source of truth)
  const filters: TaskFilters = {
    projectId,
    status: (searchParams.get('status') as any) || undefined,
    priority: (searchParams.get('priority') as any) || undefined,
    dueFrom: searchParams.get('dueFrom') || undefined,
    dueTo: searchParams.get('dueTo') || undefined,
  };

  // 1. Fetch Project Details
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: Boolean(projectId),
  });

  // 2. Fetch Tasks (patched in-place by useProjectActivity on activity:new)
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
    enabled: Boolean(projectId),
  });

  // 3. Socket real-time activity and in-place query cache patching
  const { activities, isLoading: isActivityLoading, isConnected } = useProjectActivity(projectId);

  // Determine if current user can create tasks (Admin or owning PM)
  const canCreateTask =
    user?.role === 'ADMIN' || (user?.role === 'PM' && project?.pmId === user?.id);

  // Handle 403 Forbidden State (e.g. Developer not assigned to project)
  const isForbidden =
    (projectError as any)?.response?.status === 403 ||
    (tasksError as any)?.response?.status === 403;

  if (isForbidden) {
    const errorMsg =
      (projectError as any)?.response?.data?.error?.message ||
      (tasksError as any)?.response?.data?.error?.message ||
      'You do not have permission to view this project.';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="glass-card max-w-md w-full text-center p-2">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">403 - Project Access Forbidden</CardTitle>
            <CardDescription>{errorMsg}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link to="/developer">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle Loading Skeleton for Project
  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
          {/* Progress Strip Skeleton */}
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>

        {/* FilterBar Skeleton */}
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* Board Skeleton (4 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle 404 Not Found
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-sm text-muted-foreground">The project with ID "{projectId}" does not exist.</p>
        <Link to="/admin">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to={-1 as any}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <FolderKanban className="w-5 h-5 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {project.name}
                </h1>
                {project.client && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Building2 className="w-3 h-3" />
                    <span>{project.client.name}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {project.pm && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>PM: {project.pm.name}</span>
                  </div>
                )}
                {project.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canCreateTask && (
              <Button
                onClick={() => setIsNewTaskOpen(true)}
                size="sm"
                className="gap-1.5 shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </Button>
            )}
            <NotificationBell />
          </div>
        </div>

        {/* Project Progress Strip */}
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-muted-foreground">Total Tasks: </span>
                <span className="font-bold text-foreground">{totalTasks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Completed: </span>
                <span className="font-bold text-emerald-400">{completedTasks}</span>
              </div>
              {overdueTasks > 0 && (
                <div>
                  <span className="text-muted-foreground">Overdue: </span>
                  <span className="font-bold text-rose-400">{overdueTasks}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-36 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground min-w-[32px]">
                {progressPercent}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar Synced to URL */}
      <FilterBar hideProjectFilter={true} />

      {/* Main Content Layout: Tasks (Kanban / Grid) + Live Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Task Board / Grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Tasks ({tasks.length})
            </h2>

            {/* View Mode Switcher & New Task */}
            <div className="flex items-center gap-2">
              {canCreateTask && (
                <Button
                  onClick={() => setIsNewTaskOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </Button>
              )}
              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/50">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="h-7 px-2.5 text-xs gap-1.5"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2.5 text-xs gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </Button>
            </div>
          </div>
        </div>

          {isTasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="pt-2 border-t border-border/30 flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <Card className="glass-card text-center p-8">
              <CardContent className="space-y-4">
                <Inbox className="w-10 h-10 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <CardTitle className="text-base">No tasks match these filters</CardTitle>
                  <CardDescription className="text-xs">
                    Try clearing or adjusting your status, priority, or date filters.
                  </CardDescription>
                </div>
                {(searchParams.get('status') ||
                  searchParams.get('priority') ||
                  searchParams.get('dueFrom') ||
                  searchParams.get('dueTo')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchParams({})}
                    className="text-xs mt-2"
                  >
                    Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'board' ? (
            <TaskBoard tasks={tasks} isLoading={isTasksLoading} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Live Activity Feed */}
        <div className="xl:col-span-1">
          <ActivityFeed
            activities={activities}
            isLoading={isActivityLoading}
            isConnected={isConnected}
          />
        </div>
      </div>

      {/* New Task Modal */}
      {canCreateTask && projectId && (
        <NewTaskModal
          projectId={projectId}
          projectName={project?.name}
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
        />
      )}
    </div>
  );
};

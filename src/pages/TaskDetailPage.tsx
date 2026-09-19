import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tasksApi } from '../api/tasks.api';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { TaskStatus } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckSquare,
  FolderKanban,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  Clock,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus();

  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getById(taskId!),
    enabled: Boolean(taskId),
  });

  const isForbidden = (error as any)?.response?.status === 403;

  if (isForbidden) {
    const errorMsg =
      (error as any)?.response?.data?.error?.message ||
      'You do not have access to view or update this task.';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="glass-card max-w-md w-full text-center p-2">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">403 - Task Access Forbidden</CardTitle>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Navigation Header Skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Status Change Control Panel Skeleton */}
        <Card className="glass-panel">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card md:col-span-2 space-y-3 p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
          <Card className="glass-card md:col-span-1 space-y-3 p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold">Task Not Found</h2>
        <p className="text-sm text-muted-foreground">The task with ID "{taskId}" could not be found.</p>
        <Link to="/developer">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const statuses: Array<{ value: TaskStatus; label: string; icon: any }> = [
    { value: 'TODO', label: 'To Do', icon: Clock },
    { value: 'IN_PROGRESS', label: 'In Progress', icon: Loader2 },
    { value: 'IN_REVIEW', label: 'In Review', icon: CheckSquare },
    { value: 'DONE', label: 'Done', icon: CheckCircle2 },
  ];

  const handleStatusClick = (status: TaskStatus) => {
    if (status !== task.status) {
      updateStatus({ id: task.id, status });
    }
  };

  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMMM dd, yyyy')
    : 'No due date set';

  const formattedCreatedAt = format(new Date(task.createdAt), 'MMM dd, yyyy · HH:mm');
  const formattedUpdatedAt = format(new Date(task.updatedAt), 'MMM dd, yyyy · HH:mm');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to={task.projectId ? `/projects/${task.projectId}` : -1 as any}>
            <Button variant="ghost" size="icon" className="h-9 w-9" title="Back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {task.title}
            </h1>
            {task.isOverdue && (
              <Badge variant="destructive" className="gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>OVERDUE</span>
              </Badge>
            )}
          </div>
        </div>

        {task.project && (
          <Link to={`/projects/${task.project.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FolderKanban className="w-3.5 h-3.5 text-primary" />
              <span>{task.project.name}</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Overdue Alert Banner */}
      {task.isOverdue && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-rose-200">This task is overdue</p>
            <p className="text-rose-300/80">
              The scheduled due date was {formattedDueDate}. Please review and update deliverables.
            </p>
          </div>
        </div>
      )}

      {/* Status Change Control Panel */}
      <Card className="glass-panel border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Change Task Status</CardTitle>
            {isUpdatingStatus && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating status on server...</span>
              </div>
            )}
          </div>
          <CardDescription className="text-xs">
            Changes are saved immediately via <code className="font-mono text-primary">PATCH /api/tasks/:id/status</code> and trigger an automatic refetch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statuses.map(({ value, label }) => {
              const isCurrent = task.status === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isCurrent ? 'default' : 'outline'}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusClick(value)}
                  className={`h-11 font-semibold text-xs justify-center transition-all ${
                    isCurrent
                      ? 'shadow-md shadow-primary/25 border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/40'
                  }`}
                >
                  <span>{label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description provided for this task.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium">Priority</span>
                <div>
                  <Badge variant="outline" className="font-semibold text-xs">
                    {task.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-medium">Assignee</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                    {task.assignee ? task.assignee.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </p>
                    {task.assignee?.email && (
                      <p className="text-[11px] text-muted-foreground">{task.assignee.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due Date</span>
                </span>
                <p className={`font-semibold ${task.isOverdue ? 'text-rose-400' : 'text-foreground'}`}>
                  {formattedDueDate}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-2 text-[11px] text-muted-foreground">
                <p>Created: {formattedCreatedAt}</p>
                <p>Last updated: {formattedUpdatedAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

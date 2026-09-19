import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Code,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { dashboardApi, DeveloperDashboardData } from '@/api/dashboard.api';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { TaskCard } from '@/components/tasks/TaskCard';
import { cn } from '@/lib/utils';

export const DeveloperDashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<DeveloperDashboardData>({
    queryKey: ['dashboard', 'developer'],
    queryFn: () => dashboardApi.getDeveloper(),
  });

  const totals = data?.totals;
  const tasksByStatus = data?.tasksByStatus;
  const tasksByPriority = data?.tasksByPriority;
  const assignedTasks = data?.assignedTasks || [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="icon" title="Back to Login">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Developer Dashboard
            </h1>
            <Badge variant="secondary" className="ml-2 bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-bold">
              DEVELOPER
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </header>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            {(error as any)?.response?.data?.error?.message || 'Failed to load Developer dashboard data.'}
          </p>
        </Card>
      )}

      {/* KPI Cards Grid (3 cols) */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        {/* Total Assigned */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assigned Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totals?.totalAssignedTasks ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Total active assignments</CardDescription>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="glass-card border-emerald-500/20 bg-emerald-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Completed Tasks
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                {totals?.completedTasksCount ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-emerald-400/80">Marked as DONE</CardDescription>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card
          className={cn(
            'glass-card transition-colors',
            (totals?.overdueTasksCount ?? 0) > 0 && 'border-rose-500/30 bg-rose-950/10'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle
              className={cn(
                'text-xs font-medium uppercase tracking-wider',
                (totals?.overdueTasksCount ?? 0) > 0 ? 'text-rose-400' : 'text-muted-foreground'
              )}
            >
              Overdue Tasks
            </CardTitle>
            <AlertCircle
              className={cn(
                'w-4 h-4',
                (totals?.overdueTasksCount ?? 0) > 0 ? 'text-rose-400' : 'text-muted-foreground'
              )}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div
                className={cn(
                  'text-2xl sm:text-3xl font-bold',
                  (totals?.overdueTasksCount ?? 0) > 0 ? 'text-rose-400' : 'text-foreground'
                )}
              >
                {totals?.overdueTasksCount ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Past scheduled due date</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Status & Priority Quick Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              By Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 flex-wrap">
            <Badge variant="todo" className="px-3 py-1">
              TODO: {tasksByStatus?.TODO ?? 0}
            </Badge>
            <Badge variant="inProgress" className="px-3 py-1">
              IN PROGRESS: {tasksByStatus?.IN_PROGRESS ?? 0}
            </Badge>
            <Badge variant="inReview" className="px-3 py-1">
              IN REVIEW: {tasksByStatus?.IN_REVIEW ?? 0}
            </Badge>
            <Badge variant="done" className="px-3 py-1">
              DONE: {tasksByStatus?.DONE ?? 0}
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              By Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 flex-wrap">
            <Badge variant="critical" className="px-3 py-1">
              CRITICAL: {tasksByPriority?.CRITICAL ?? 0}
            </Badge>
            <Badge variant="high" className="px-3 py-1">
              HIGH: {tasksByPriority?.HIGH ?? 0}
            </Badge>
            <Badge variant="medium" className="px-3 py-1">
              MEDIUM: {tasksByPriority?.MEDIUM ?? 0}
            </Badge>
            <Badge variant="low" className="px-3 py-1">
              LOW: {tasksByPriority?.LOW ?? 0}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Tasks Section */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              <span>Assigned Tasks</span>
            </CardTitle>
            <CardDescription>
              Sorted strictly by priority (Critical &gt; High &gt; Medium &gt; Low) then due date
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : assignedTasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-60" />
              <p className="text-base font-medium text-foreground">No tasks assigned</p>
              <p className="text-xs">You currently don't have any tasks assigned to your account.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

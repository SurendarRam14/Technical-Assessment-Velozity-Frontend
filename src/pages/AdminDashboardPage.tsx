import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ArrowLeft,
  Users,
  FolderKanban,
  Activity,
  CheckSquare,
  Building2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { dashboardApi, AdminDashboardData } from '@/api/dashboard.api';
import { usePresence } from '@/sockets/usePresence';
import { PresenceBadge } from '@/components/presence/PresenceBadge';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  const { count: presenceCount, isConnected: isPresenceConnected } = usePresence();

  const { data, isLoading, error } = useQuery<AdminDashboardData>({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardApi.getAdmin(),
  });

  const totals = data?.totals;
  const tasksByStatus = data?.tasksByStatus;
  const recentActivity = data?.recentActivity || [];

  const totalTasks = totals?.totalTasks || 0;

  const getStatusPercentage = (status: TaskStatus) => {
    if (!totalTasks || !tasksByStatus) return 0;
    return Math.round(((tasksByStatus[status] || 0) / totalTasks) * 100);
  };

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
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <Badge variant="default" className="ml-2 font-bold">
              ADMIN
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PresenceBadge count={presenceCount} isConnected={isPresenceConnected} />
          <NotificationBell />
        </div>
      </header>

      {/* Error state */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            {(error as any)?.response?.data?.error?.message || 'Failed to load admin dashboard data.'}
          </p>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Projects */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Projects
            </CardTitle>
            <FolderKanban className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totals?.totalProjects ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Across all clients</CardDescription>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totals?.totalTasks ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">System-wide tasks</CardDescription>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Clients
            </CardTitle>
            <Building2 className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totals?.totalClients ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Active client accounts</CardDescription>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted/40 rounded animate-pulse" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totals?.totalUsers ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Admins, PMs & Devs</CardDescription>
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

        {/* Online Presence */}
        <Card className="glass-card relative overflow-hidden border-emerald-500/20 bg-emerald-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Online Now
            </CardTitle>
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors duration-300',
                isPresenceConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'
              )}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {presenceCount}
            </div>
            <CardDescription className="text-[11px] mt-1 text-emerald-400/80">
              {isPresenceConnected ? 'Active WebSocket users' : 'Connecting...'}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Status Distribution & Global Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Status Distribution (1 col) */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span>Status Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of all {totalTasks} tasks in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* To Do */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      To Do
                    </span>
                    <span className="text-muted-foreground">
                      {tasksByStatus?.TODO ?? 0} ({getStatusPercentage('TODO')}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusPercentage('TODO')}%` }}
                    />
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      In Progress
                    </span>
                    <span className="text-muted-foreground">
                      {tasksByStatus?.IN_PROGRESS ?? 0} ({getStatusPercentage('IN_PROGRESS')}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusPercentage('IN_PROGRESS')}%` }}
                    />
                  </div>
                </div>

                {/* In Review */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      In Review
                    </span>
                    <span className="text-muted-foreground">
                      {tasksByStatus?.IN_REVIEW ?? 0} ({getStatusPercentage('IN_REVIEW')}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusPercentage('IN_REVIEW')}%` }}
                    />
                  </div>
                </div>

                {/* Done */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Done
                    </span>
                    <span className="text-muted-foreground">
                      {tasksByStatus?.DONE ?? 0} ({getStatusPercentage('DONE')}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusPercentage('DONE')}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Global Recent Activity Feed (2 cols) */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Global Activity Feed</span>
              </CardTitle>
              <CardDescription>Latest status transitions across all client projects</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Latest 10 events
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No activity logs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentActivity.map((act) => {
                  const timeAgo = act.createdAt
                    ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })
                    : '';

                  return (
                    <div
                      key={act.id}
                      className="py-3 flex items-start gap-3 text-xs leading-relaxed hover:bg-muted/10 transition-colors rounded-lg px-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0 mt-0.5">
                        {act.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-foreground">
                          <span className="font-semibold">{act.user?.name || 'Someone'}</span>{' '}
                          <span className="text-muted-foreground">moved</span>{' '}
                          <Link
                            to={`/tasks/${act.taskId}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {act.task?.title || `Task #${act.taskId.slice(0, 8)}`}
                          </Link>{' '}
                          <span className="text-muted-foreground">from</span>{' '}
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted/50">
                            {act.fromStatus || 'NONE'}
                          </span>{' '}
                          <ArrowRight className="inline w-3 h-3 text-muted-foreground mx-0.5" />{' '}
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {act.toStatus}
                          </span>
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

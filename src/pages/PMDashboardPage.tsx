import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  ArrowLeft,
  FolderKanban,
  FolderPlus,
  CheckSquare,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { dashboardApi, PmDashboardData } from '@/api/dashboard.api';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

export const PMDashboardPage: React.FC = () => {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const { data, isLoading, error } = useQuery<PmDashboardData>({
    queryKey: ['dashboard', 'pm'],
    queryFn: () => dashboardApi.getPm(),
  });

  const totals = data?.totals;
  const tasksByStatus = data?.tasksByStatus;
  const tasksByPriority = data?.tasksByPriority;
  const projects = data?.projects || [];
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
            <Briefcase className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Project Manager Dashboard
            </h1>
            <Badge variant="secondary" className="ml-2 bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold">
              PM
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
        </div>
      </header>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            {(error as any)?.response?.data?.error?.message || 'Failed to load PM dashboard data.'}
          </p>
        </Card>
      )}

      {/* KPI Cards Grid (4 cols) */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Owned Projects */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Owned Projects
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
            <CardDescription className="text-[11px] mt-1">Under your management</CardDescription>
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
            <CardDescription className="text-[11px] mt-1">Across owned projects</CardDescription>
          </CardContent>
        </Card>

        {/* Due This Week */}
        <Card
          className={cn(
            'glass-card transition-colors',
            (totals?.dueThisWeekCount ?? 0) > 0 && 'border-amber-500/30 bg-amber-950/10'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle
              className={cn(
                'text-xs font-medium uppercase tracking-wider',
                (totals?.dueThisWeekCount ?? 0) > 0 ? 'text-amber-400' : 'text-muted-foreground'
              )}
            >
              Due This Week
            </CardTitle>
            <Clock
              className={cn(
                'w-4 h-4',
                (totals?.dueThisWeekCount ?? 0) > 0 ? 'text-amber-400' : 'text-muted-foreground'
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
                  (totals?.dueThisWeekCount ?? 0) > 0 ? 'text-amber-400' : 'text-foreground'
                )}
              >
                {totals?.dueThisWeekCount ?? 0}
              </div>
            )}
            <CardDescription className="text-[11px] mt-1">Next 7 days deadline</CardDescription>
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
            <CardDescription className="text-[11px] mt-1">Requires immediate attention</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns Row: Status & Priority */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span>Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">To Do</span>
                    <span className="text-muted-foreground">{tasksByStatus?.TODO ?? 0} ({getStatusPercentage('TODO')}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${getStatusPercentage('TODO')}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-400 font-medium">In Progress</span>
                    <span className="text-muted-foreground">{tasksByStatus?.IN_PROGRESS ?? 0} ({getStatusPercentage('IN_PROGRESS')}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${getStatusPercentage('IN_PROGRESS')}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-medium">In Review</span>
                    <span className="text-muted-foreground">{tasksByStatus?.IN_REVIEW ?? 0} ({getStatusPercentage('IN_REVIEW')}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${getStatusPercentage('IN_REVIEW')}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-medium">Done</span>
                    <span className="text-muted-foreground">{tasksByStatus?.DONE ?? 0} ({getStatusPercentage('DONE')}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${getStatusPercentage('DONE')}%` }} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Priority Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-1">
                  <div className="text-xs text-muted-foreground">Low Priority</div>
                  <div className="text-xl font-bold text-foreground">{tasksByPriority?.LOW ?? 0}</div>
                </div>
                <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-950/10 space-y-1">
                  <div className="text-xs text-blue-400 font-medium">Medium Priority</div>
                  <div className="text-xl font-bold text-blue-300">{tasksByPriority?.MEDIUM ?? 0}</div>
                </div>
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-950/10 space-y-1">
                  <div className="text-xs text-amber-400 font-medium">High Priority</div>
                  <div className="text-xl font-bold text-amber-300">{tasksByPriority?.HIGH ?? 0}</div>
                </div>
                <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-950/10 space-y-1">
                  <div className="text-xs text-rose-400 font-medium">Critical Priority</div>
                  <div className="text-xl font-bold text-rose-300">{tasksByPriority?.CRITICAL ?? 0}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects Summary Section */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary" />
              <span>Projects Summary</span>
            </CardTitle>
            <CardDescription>Track progress and deliverables across your owned projects</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <FolderKanban className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-medium">No projects assigned</p>
              <p className="text-xs">You currently don't own any active client projects.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-all duration-200 space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-bold text-foreground text-base hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <span>{project.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      {project.client && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span>{project.client.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold text-emerald-400">
                        {project.progressPercentage}%
                      </span>
                      <p className="text-[10px] text-muted-foreground">complete</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>

                  {/* Task counts pill strip */}
                  <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>Total: <strong className="text-foreground">{project.taskCounts.total}</strong></span>
                      <span>Done: <strong className="text-emerald-400">{project.taskCounts.done}</strong></span>
                      {project.taskCounts.overdue > 0 && (
                        <span className="text-rose-400 font-semibold">
                          Overdue: {project.taskCounts.overdue}
                        </span>
                      )}
                    </div>

                    <Link to={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <span>Board</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Live updates from your owned projects</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Latest events
          </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent activity recorded on your projects.
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
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-semibold flex-shrink-0 mt-0.5">
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
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
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

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />
    </div>
  );
};

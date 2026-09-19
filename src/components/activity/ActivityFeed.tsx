import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFeedProps {
  activities: ActivityLog[];
  isLoading?: boolean;
  isConnected?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  isConnected = false,
}) => {
  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    let variant = 'outline';
    if (status === 'TODO') variant = 'todo';
    if (status === 'IN_PROGRESS') variant = 'inProgress';
    if (status === 'IN_REVIEW') variant = 'inReview';
    if (status === 'DONE') variant = 'done';

    return (
      <Badge variant={variant as any} className="text-[10px] uppercase px-1.5 py-0">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="glass-card shadow-md">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Live Project Activity</CardTitle>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
              }`}
            />
            <span className="text-[11px] text-muted-foreground">
              {isConnected ? 'Live WebSocket' : 'Connecting...'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2 rounded-md">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground italic">
            No activity recorded yet for this project.
          </div>
        ) : (
          <div className="divide-y divide-border/30 max-h-[420px] overflow-y-auto">
            {activities.map((item) => {
              const userName = item.user?.name || 'User';
              const taskTitle = item.task?.title || `Task #${item.taskId.slice(0, 6)}`;
              const relativeTime = formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              });

              return (
                <div key={item.id} className="p-3 hover:bg-secondary/20 transition-colors text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {userName}
                    </span>
                    <span className="text-[10px] shrink-0">{relativeTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground">
                    <span className="text-foreground/90 font-medium truncate max-w-[180px]">
                      {taskTitle}
                    </span>
                    <span className="text-[11px]">moved from</span>
                    {item.fromStatus ? (
                      getStatusBadge(item.fromStatus)
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Created</span>
                    )}
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    {getStatusBadge(item.toStatus)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

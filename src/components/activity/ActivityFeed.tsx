import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
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
              const shortId = item.taskId.slice(0, 8);
              const from = item.fromStatus || 'NONE';
              const to = item.toStatus;
              const relativeTime = formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              });

              return (
                <div
                  key={item.id}
                  className="p-3 hover:bg-secondary/20 transition-colors text-xs leading-relaxed text-foreground"
                >
                  <span className="font-semibold">{userName}</span>
                  {' moved '}
                  <Link
                    to={`/tasks/${item.taskId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Task #{shortId}
                  </Link>
                  {' from '}
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
                    {from}
                  </span>
                  {' → '}
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {to}
                  </span>
                  {' · '}
                  <span className="text-muted-foreground">{relativeTime}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { activityApi } from '../api/activity.api';
import { ActivityLog, Task, TaskStatus } from '../types';

export const useProjectActivity = (projectId?: string) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ref to always access latest activities without stale closure
  const activitiesRef = useRef<ActivityLog[]>(activities);
  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  const lastSeenAtRef = useRef<string | null>(null);
  const wasDisconnectedRef = useRef<boolean>(false);

  // 1. Initial fetch of recent activity
  useEffect(() => {
    let isMounted = true;

    const fetchInitialActivity = async () => {
      try {
        const data = await activityApi.list({ projectId, limit: 20 });
        if (isMounted) {
          setActivities(data);
          if (data.length > 0) {
            lastSeenAtRef.current = data[0].createdAt;
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial activity:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialActivity();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // 2. Reconnect catch-up function
  const performCatchup = useCallback(async () => {
    // Timestamp of the latest event already shown in the feed
    const lastShownTimestamp =
      activitiesRef.current[0]?.createdAt || lastSeenAtRef.current || undefined;

    try {
      const missed = await activityApi.list({
        projectId,
        since: lastShownTimestamp,
        limit: 20,
      });

      if (missed && missed.length > 0) {
        console.log(`[useProjectActivity] Caught up ${missed.length} missed events`);

        setActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newItems = missed.filter((m) => !existingIds.has(m.id));
          if (newItems.length === 0) return prev;
          return [...newItems, ...prev];
        });

        lastSeenAtRef.current = missed[0].createdAt;

        // Invalidate tasks query cache to sync board with any missed task status transitions
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
      }
    } catch (err) {
      console.error('[useProjectActivity] Catchup error:', err);
    }
  }, [projectId, queryClient]);

  // 3. Socket event handling: activity:new, disconnect, connect, reconnect
  useEffect(() => {
    if (!socket) return;

    const handleActivityNew = (event: {
      id: string;
      taskId: string;
      projectId: string;
      userId: string;
      userName: string;
      fromStatus: TaskStatus | null;
      toStatus: TaskStatus;
      createdAt: string;
    }) => {
      // Filter by projectId if scoped to a specific project
      if (projectId && event.projectId !== projectId) {
        return;
      }

      const newLog: ActivityLog = {
        id: event.id,
        taskId: event.taskId,
        projectId: event.projectId,
        userId: event.userId,
        user: {
          id: event.userId,
          name: event.userName,
          email: '',
        },
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        createdAt: event.createdAt,
      };

      // Prepend to local activity feed, deduplicating
      setActivities((prev) => {
        if (prev.some((a) => a.id === event.id)) return prev;
        return [newLog, ...prev];
      });

      lastSeenAtRef.current = event.createdAt;

      // In-place patch query cache for all ['tasks', ...] queries
      queryClient.setQueriesData<Task[]>(
        { queryKey: ['tasks'] },
        (oldTasks) => {
          if (!oldTasks) return oldTasks;
          return oldTasks.map((t) => {
            if (t.id === event.taskId) {
              return {
                ...t,
                status: event.toStatus,
                isOverdue: event.toStatus === 'DONE' ? false : t.isOverdue,
              };
            }
            return t;
          });
        }
      );

      // In-place patch individual task query if open
      queryClient.setQueryData<Task>(
        ['task', event.taskId],
        (oldTask) => {
          if (!oldTask) return oldTask;
          return {
            ...oldTask,
            status: event.toStatus,
            isOverdue: event.toStatus === 'DONE' ? false : oldTask.isOverdue,
          };
        }
      );
    };

    const handleDisconnect = () => {
      console.log('[useProjectActivity] Socket disconnected');
      wasDisconnectedRef.current = true;
    };

    const handleConnect = () => {
      if (wasDisconnectedRef.current) {
        console.log('[useProjectActivity] Socket reconnected after disconnect, triggering catchup...');
        wasDisconnectedRef.current = false;
        performCatchup();
      }
    };

    // Also handle browser window online event (DevTools offline/online toggle)
    const handleOnline = () => {
      console.log('[useProjectActivity] Browser came online, checking catchup...');
      performCatchup();
    };

    socket.on('activity:new', handleActivityNew);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);
    socket.io?.on('reconnect', handleConnect);
    window.addEventListener('online', handleOnline);

    return () => {
      socket.off('activity:new', handleActivityNew);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
      socket.io?.off('reconnect', handleConnect);
      window.removeEventListener('online', handleOnline);
    };
  }, [socket, projectId, queryClient, performCatchup]);

  return {
    activities,
    isLoading,
    isConnected,
  };
};

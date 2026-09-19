import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { activityApi } from '../api/activity.api';
import { ActivityLog, Task, TaskStatus } from '../types';

export const useProjectActivity = (projectId?: string) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastSeenAtRef = useRef<string | null>(null);

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
      } catch {
        // Fallback gracefully
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

  // 2. Real-time activity:new listener and in-place cache patching
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

      // Prepend to local activity feed
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

    socket.on('activity:new', handleActivityNew);

    // 3. Reconnect catchup via DB
    const handleReconnect = async () => {
      if (!lastSeenAtRef.current) return;
      try {
        const missed = await activityApi.list({
          projectId,
          since: lastSeenAtRef.current,
          limit: 20,
        });

        if (missed.length > 0) {
          setActivities((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newItems = missed.filter((m) => !existingIds.has(m.id));
            return [...newItems, ...prev];
          });
          lastSeenAtRef.current = missed[0].createdAt;
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      } catch {
        // Ignore catchup error
      }
    };

    socket.on('connect', handleReconnect);

    return () => {
      socket.off('activity:new', handleActivityNew);
      socket.off('connect', handleReconnect);
    };
  }, [socket, projectId, queryClient]);

  return {
    activities,
    isLoading,
    isConnected,
  };
};

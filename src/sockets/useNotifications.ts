import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { useAuth } from '../auth/useAuth';
import { notificationsApi, NotificationsListResponse } from '../api/notifications.api';
import { Notification } from '../types';

interface NotificationNewPayload {
  id: string;
  message: string;
  taskId?: string | null;
  createdAt: string;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuth();

  // 1. Fetch notifications via TanStack Query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationsListResponse>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    enabled: !!user,
    staleTime: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;

  // 2. Real-time socket listener for notification:new
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (payload: NotificationNewPayload) => {
      // Optimistically prepend to cache and increment unread count
      queryClient.setQueryData<NotificationsListResponse>(['notifications'], (old) => {
        if (!old) {
          const newNotif: Notification = {
            id: payload.id,
            userId: user.id,
            taskId: payload.taskId || null,
            message: payload.message,
            read: false,
            createdAt: payload.createdAt || new Date().toISOString(),
          };
          return {
            notifications: [newNotif],
            unreadCount: 1,
          };
        }

        // Avoid duplicate insertion
        if (old.notifications.some((n) => n.id === payload.id)) {
          return old;
        }

        const newNotif: Notification = {
          id: payload.id,
          userId: user.id,
          taskId: payload.taskId || null,
          message: payload.message,
          read: false,
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        return {
          notifications: [newNotif, ...old.notifications],
          unreadCount: old.unreadCount + 1,
        };
      });

      // Also invalidate to sync any populated relations (e.g. task details)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, user, queryClient]);

  // 3. Mutation to mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsListResponse>(['notifications']);

      queryClient.setQueryData<NotificationsListResponse>(['notifications'], (old) => {
        if (!old) return old;
        const target = old.notifications.find((n) => n.id === id);
        const wasUnread = target && !target.read;

        return {
          notifications: old.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // 4. Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsListResponse>(['notifications']);

      queryClient.setQueryData<NotificationsListResponse>(['notifications'], (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

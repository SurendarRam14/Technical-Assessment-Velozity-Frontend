import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, BellOff, ExternalLink } from 'lucide-react';
import { Notification } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isMarkingAll: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  isMarkingAll,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
    if (notif.taskId) {
      navigate(`/tasks/${notif.taskId}`);
      onClose();
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-bold">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={isMarkingAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-primary" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
              <BellOff className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">
              You're all caught up! New updates will appear here in real time.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const timeAgo = notif.createdAt
              ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
              : '';

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'group flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left',
                  notif.read
                    ? 'bg-transparent hover:bg-muted/30 opacity-75'
                    : 'bg-primary/5 hover:bg-primary/10 opacity-100'
                )}
              >
                {/* Unread indicator dot */}
                <div className="pt-1 flex-shrink-0">
                  <span
                    className={cn(
                      'block w-2 h-2 rounded-full transition-colors',
                      notif.read ? 'bg-transparent' : 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p
                    className={cn(
                      'text-xs leading-relaxed line-clamp-2',
                      notif.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                    )}
                  >
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{timeAgo}</span>
                    {notif.taskId && (
                      <span className="inline-flex items-center gap-0.5 text-primary group-hover:underline">
                        View task <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Mark as read button if unread */}
                {!notif.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notif.id);
                    }}
                    title="Mark as read"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-opacity"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

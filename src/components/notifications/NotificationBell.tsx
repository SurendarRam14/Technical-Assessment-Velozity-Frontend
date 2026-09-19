import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '../../sockets/useNotifications';
import { cn } from '../../lib/utils';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative transition-all duration-200',
          isOpen && 'bg-accent text-accent-foreground border-primary/50'
        )}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          isMarkingAll={isMarkingAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

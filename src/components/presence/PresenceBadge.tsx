import React from 'react';
import { cn } from '@/lib/utils';

interface PresenceBadgeProps {
  count: number;
  isConnected?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const PresenceBadge: React.FC<PresenceBadgeProps> = ({
  count,
  isConnected = true,
  className,
  showLabel = true,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300',
        isConnected
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
          : 'bg-muted/30 text-muted-foreground border-border/40',
        className
      )}
      title={isConnected ? `Live: ${count} active user${count === 1 ? '' : 's'} online` : 'WebSocket disconnected'}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2 transition-colors duration-300',
            isConnected ? 'bg-emerald-500' : 'bg-muted-foreground/50'
          )}
        />
      </span>

      {showLabel && (
        <span className="tabular-nums font-semibold tracking-tight">
          {isConnected ? (
            <>
              {count} <span className="font-normal text-emerald-400/80">online</span>
            </>
          ) : (
            <span className="text-muted-foreground">Offline</span>
          )}
        </span>
      )}
    </div>
  );
};

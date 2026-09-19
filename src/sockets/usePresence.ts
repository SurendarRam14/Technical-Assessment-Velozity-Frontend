import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

interface PresenceCountPayload {
  count: number;
}

export interface UsePresenceReturn {
  count: number;
  isConnected: boolean;
}

export const usePresence = (): UsePresenceReturn => {
  const { socket, isConnected } = useSocket();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    const handlePresenceCount = (data: PresenceCountPayload) => {
      if (typeof data?.count === 'number') {
        setCount(data.count);
      }
    };

    // Listen to presence:count broadcast events
    socket.on('presence:count', handlePresenceCount);

    // Request immediate current presence count from server
    if (socket.connected) {
      socket.emit('presence:join');
    }

    const handleConnect = () => {
      socket.emit('presence:join');
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('presence:count', handlePresenceCount);
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  return {
    count,
    isConnected,
  };
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';
import { setAccessToken as setAxiosAccessToken, registerLogoutHandler } from '../api/axios';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token to Axios helper
  const handleSetToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setAxiosAccessToken(token);
  }, []);

  const handleLogoutState = useCallback(() => {
    setUser(null);
    handleSetToken(null);
  }, [handleSetToken]);

  // Handle silent token refresh on app startup
  useEffect(() => {
    registerLogoutHandler(() => {
      handleLogoutState();
    });

    let isMounted = true;
    const initAuth = async () => {
      try {
        const data = await authApi.refresh();
        if (isMounted) {
          setUser(data.user);
          handleSetToken(data.accessToken);
        }
      } catch {
        // No active session or refresh cookie expired
        if (isMounted) {
          handleLogoutState();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [handleLogoutState, handleSetToken]);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    handleSetToken(data.accessToken);
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      handleLogoutState();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

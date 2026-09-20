import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { RequireRole } from './auth/RequireRole';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { PMDashboardPage } from './pages/PMDashboardPage';
import { DeveloperDashboardPage } from './pages/DeveloperDashboardPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing Project Pulse...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'PM') return <Navigate to="/pm" replace />;
  return <Navigate to="/developer" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <RequireRole roles={['ADMIN']}>
        <AdminDashboardPage />
      </RequireRole>
    ),
  },
  {
    path: '/admin/projects',
    element: (
      <RequireRole roles={['ADMIN']}>
        <AdminProjectsPage />
      </RequireRole>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RequireRole roles={['ADMIN']}>
        <AdminUsersPage />
      </RequireRole>
    ),
  },
  {
    path: '/admin/clients',
    element: (
      <RequireRole roles={['ADMIN']}>
        <AdminClientsPage />
      </RequireRole>
    ),
  },
  {
    path: '/pm',
    element: (
      <RequireRole roles={['PM']}>
        <PMDashboardPage />
      </RequireRole>
    ),
  },
  {
    path: '/developer',
    element: (
      <RequireRole roles={['DEVELOPER']}>
        <DeveloperDashboardPage />
      </RequireRole>
    ),
  },
  {
    path: '/projects/:projectId',
    element: (
      <RequireRole>
        <ProjectDetailPage />
      </RequireRole>
    ),
  },
  {
    path: '/tasks/:taskId',
    element: (
      <RequireRole>
        <TaskDetailPage />
      </RequireRole>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

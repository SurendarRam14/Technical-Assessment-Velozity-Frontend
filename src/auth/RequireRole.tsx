import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Role } from '../types';
import { useAuth } from './useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

interface RequireRoleProps {
  roles?: Role[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const userRoleDashboard =
      user.role === 'ADMIN' ? '/admin' : user.role === 'PM' ? '/pm' : '/developer';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="glass-card max-w-md w-full text-center p-2">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">403 - Access Forbidden</CardTitle>
            <CardDescription>
              Your account with role <Badge variant="secondary">{user.role}</Badge> does not have permission to view this resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Required roles: {roles.map((r) => <Badge key={r} variant="outline" className="mx-0.5">{r}</Badge>)}
            </p>
            <Link to={userRoleDashboard} className="block">
              <Button className="w-full gap-2">
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-background">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">404 - Page Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The requested page does not exist or you do not have permission to view it.
      </p>
      <Link to="/login">
        <Button variant="default">Return to Login</Button>
      </Link>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Loader2, Shield, FolderKanban, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserNav: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'ADMIN':
        return <Badge variant="default" className="text-[10px] px-1.5 py-0 font-bold">ADMIN</Badge>;
      case 'PM':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-bold bg-amber-500/15 text-amber-400 border-amber-500/30"
          >
            PM
          </Badge>
        );
      case 'DEVELOPER':
        return (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-bold bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
          >
            DEV
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border/60">
      {/* Admin Quick Nav Links */}
      {user.role === 'ADMIN' && (
        <div className="flex items-center gap-1 pr-2 sm:pr-3 border-r border-border/60">
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
              title="Admin Overview"
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="hidden lg:inline">Overview</span>
            </Button>
          </Link>
          <Link to="/admin/projects">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
              title="All Projects"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Projects</span>
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
              title="Users Directory"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Users</span>
            </Button>
          </Link>
          <Link to="/admin/clients">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
              title="Clients Directory"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Clients</span>
            </Button>
          </Link>
        </div>
      )}
      {/* User Info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary/80 border border-border/80 flex items-center justify-center font-bold text-xs text-foreground shadow-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
              {user.name}
            </span>
            {getRoleBadge()}
          </div>
          <span className="text-[11px] text-muted-foreground truncate max-w-[120px] mt-0.5">
            {user.email}
          </span>
        </div>
      </div>

      {/* Switch User / Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="h-8 px-2 sm:px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5"
        title="Sign Out / Switch User"
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Switch User</span>
          </>
        )}
      </Button>
    </div>
  );
};

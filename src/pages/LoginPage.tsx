import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Briefcase, Code, Loader2, AlertCircle, Lock, Mail, LogOut, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleContinue = () => {
    if (!user) return;
    const from = (location.state as any)?.from?.pathname;
    const defaultRoute =
      user.role === 'ADMIN' ? '/admin' : user.role === 'PM' ? '/pm' : '/developer';
    navigate(from || defaultRoute, { replace: true });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setError(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      const from = (location.state as any)?.from?.pathname;
      const defaultRoute =
        loggedInUser.role === 'ADMIN'
          ? '/admin'
          : loggedInUser.role === 'PM'
          ? '/pm'
          : '/developer';
      navigate(from || defaultRoute, { replace: true });
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Authentication failed. Please check your credentials.';
      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (fillEmail: string) => {
    setEmail(fillEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-lg shadow-primary/5">
            <span className="text-2xl font-black tracking-tight">V</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Velozity</h1>
          <p className="text-sm text-muted-foreground">Real-Time Client Project Dashboard</p>
        </div>

        <Card className="glass-card shadow-2xl border-border/60">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials or click a quick-fill demo account below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <span>{user.name}</span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">{user.role}</Badge>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full text-xs h-8 font-medium gap-1"
                    onClick={handleContinue}
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 font-medium text-destructive hover:bg-destructive/10 gap-1"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Email Address</span>
                </label>
                <Input
                  type="email"
                  placeholder="name@velozity.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Password</span>
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-border/40 space-y-2.5">
              <p className="text-xs font-medium text-muted-foreground">Quick-fill Demo Accounts:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('admin@velozity.com')}
                  className="flex flex-col h-auto py-2 px-1 text-xs gap-1 hover:border-primary/50"
                >
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">Admin</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">ADMIN</Badge>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('pm1@velozity.com')}
                  className="flex flex-col h-auto py-2 px-1 text-xs gap-1 hover:border-amber-400/50"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Sarah (PM)</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">PM</Badge>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill('dev1@velozity.com')}
                  className="flex flex-col h-auto py-2 px-1 text-xs gap-1 hover:border-cyan-400/50"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">Alex (Dev)</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0">DEV</Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

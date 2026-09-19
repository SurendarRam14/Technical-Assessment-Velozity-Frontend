import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api';
import { clientsApi } from '../../api/clients.api';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { FolderPlus, X, Building2, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: any) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [pmId, setPmId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  // Fetch clients for dropdown
  const {
    data: clients = [],
    isLoading: isClientsLoading,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
    enabled: isOpen,
  });

  // Fetch users for PM dropdown (only needed for Admin)
  const {
    data: users = [],
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: isOpen && isAdmin,
  });

  // Filter PMs and Admins for PM assignment
  const pms = users.filter((u) => u.role === 'PM' || u.role === 'ADMIN');

  // Project creation mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; clientId: string; pmId?: string }) =>
      projectsApi.create(data),
    onSuccess: (newProject) => {
      // Invalidate projects and dashboard queries so changes reflect immediately
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
      if (onSuccess) onSuccess(newProject);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to create project';
      setFormError(msg);
    },
  });

  const handleClose = () => {
    setName('');
    setClientId('');
    setPmId('');
    setFormError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Project name is required');
      return;
    }
    if (!clientId) {
      setFormError('Please select a client');
      return;
    }
    if (isAdmin && !pmId) {
      setFormError('Please select a project manager');
      return;
    }

    createProjectMutation.mutate({
      name: trimmedName,
      clientId,
      pmId: isAdmin ? pmId : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      <Card className="relative w-full max-w-lg glass-card border border-border shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Create New Project</CardTitle>
              <CardDescription className="text-xs">
                Set up a new client project workspace
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Project Name */}
            <div className="space-y-1.5">
              <label htmlFor="project-name" className="text-xs font-semibold text-foreground">
                Project Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="project-name"
                placeholder="e.g., Mobile Streaming Platform"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/40 border-border/60"
                disabled={createProjectMutation.isPending}
                autoFocus
              />
            </div>

            {/* Client Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="project-client" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Client <span className="text-destructive">*</span></span>
              </label>
              <select
                id="project-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isClientsLoading || createProjectMutation.isPending}
                className="w-full h-10 px-3 py-2 text-sm bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="" disabled className="bg-background text-muted-foreground">
                  {isClientsLoading ? 'Loading clients...' : 'Select a client'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-background text-foreground">
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PM Dropdown - ONLY shown when creator is Admin */}
            {isAdmin && (
              <div className="space-y-1.5">
                <label htmlFor="project-pm" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Assigned Project Manager <span className="text-destructive">*</span></span>
                </label>
                <select
                  id="project-pm"
                  value={pmId}
                  onChange={(e) => setPmId(e.target.value)}
                  disabled={isUsersLoading || createProjectMutation.isPending}
                  className="w-full h-10 px-3 py-2 text-sm bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="" disabled className="bg-background text-muted-foreground">
                    {isUsersLoading ? 'Loading project managers...' : 'Select a project manager'}
                  </option>
                  {pms.map((pm) => (
                    <option key={pm.id} value={pm.id} className="bg-background text-foreground">
                      {pm.name} ({pm.email}) {pm.role === 'ADMIN' ? '[Admin]' : '[PM]'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="flex items-center justify-end gap-3 pt-2 pb-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="gap-2 min-w-[120px]"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Project</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

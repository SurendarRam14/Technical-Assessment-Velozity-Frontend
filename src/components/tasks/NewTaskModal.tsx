import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api';
import { usersApi } from '../../api/users.api';
import { Priority, TaskStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckSquare, X, User, Calendar, Flag, AlertCircle, Loader2 } from 'lucide-react';

interface NewTaskModalProps {
  projectId: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (task: any) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch users to populate developer assignees
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users', 'DEVELOPER'],
    queryFn: () => usersApi.list('DEVELOPER'),
    enabled: isOpen,
  });

  // Filter for developers (supports both scoped and full response)
  const developers = users.filter((u) => u.role === 'DEVELOPER');

  // Task creation mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      assigneeId?: string;
      priority: Priority;
      dueDate?: string;
      status: TaskStatus;
    }) => projectsApi.createTask(projectId, data),
    onSuccess: (newTask) => {
      // Invalidate all tasks queries for this project and general project/dashboard queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
      if (onSuccess) onSuccess(newTask);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to create task';
      setFormError(msg);
    },
  });

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setPriority('MEDIUM');
    setDueDate('');
    setFormError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Task title is required');
      return;
    }

    createTaskMutation.mutate({
      title: trimmedTitle,
      description: description.trim() || undefined,
      assigneeId: assigneeId ? assigneeId : undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      status: 'TODO',
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
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Create New Task</CardTitle>
              <CardDescription className="text-xs">
                {projectName ? `Add task to "${projectName}"` : 'Add task to this project'}
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
          <CardContent className="space-y-4 pt-6 max-h-[75vh] overflow-y-auto">
            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="space-y-1.5">
              <label htmlFor="task-title" className="text-xs font-semibold text-foreground">
                Task Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="task-title"
                placeholder="e.g., Implement SAML / OIDC Authentication"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary/40 border-border/60"
                disabled={createTaskMutation.isPending}
                autoFocus
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1.5">
              <label htmlFor="task-desc" className="text-xs font-semibold text-foreground">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="task-desc"
                rows={3}
                placeholder="Add implementation notes, acceptance criteria, or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createTaskMutation.isPending}
                className="w-full px-3 py-2 text-sm bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Assignee Dropdown (Developers) */}
            <div className="space-y-1.5">
              <label htmlFor="task-assignee" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Assignee (Developer)</span>
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={isUsersLoading || createTaskMutation.isPending}
                className="w-full h-10 px-3 py-2 text-sm bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="" className="bg-background text-foreground">
                  Unassigned
                </option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-background text-foreground">
                    {dev.name} ({dev.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Due Date (2-column layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-1.5">
                <label htmlFor="task-priority" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Priority</span>
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  disabled={createTaskMutation.isPending}
                  className="w-full h-10 px-3 py-2 text-sm bg-secondary/40 border border-border/60 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="LOW" className="bg-background text-foreground">Low</option>
                  <option value="MEDIUM" className="bg-background text-foreground">Medium</option>
                  <option value="HIGH" className="bg-background text-foreground">High</option>
                  <option value="CRITICAL" className="bg-background text-foreground">Critical</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label htmlFor="task-duedate" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Due Date</span>
                </label>
                <Input
                  id="task-duedate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={createTaskMutation.isPending}
                  className="bg-secondary/40 border-border/60 text-foreground"
                />
              </div>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <CardFooter className="flex items-center justify-end gap-3 pt-2 pb-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="gap-2 min-w-[120px]"
            >
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

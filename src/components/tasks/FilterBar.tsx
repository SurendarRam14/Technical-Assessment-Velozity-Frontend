import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Filter, X, Calendar } from 'lucide-react';

interface FilterBarProps {
  hideProjectFilter?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ hideProjectFilter = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const currentDueFrom = searchParams.get('dueFrom') || '';
  const currentDueTo = searchParams.get('dueTo') || '';
  const currentProjectId = searchParams.get('projectId') || '';

  const hasActiveFilters =
    Boolean(currentStatus) ||
    Boolean(currentPriority) ||
    Boolean(currentDueFrom) ||
    Boolean(currentDueTo) ||
    (!hideProjectFilter && Boolean(currentProjectId));

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('status');
    next.delete('priority');
    next.delete('dueFrom');
    next.delete('dueTo');
    if (!hideProjectFilter) {
      next.delete('projectId');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter Tasks</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => updateParam('status', e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background/60 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Priority</label>
          <select
            value={currentPriority}
            onChange={(e) => updateParam('priority', e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background/60 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Due From Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Due From</span>
          </label>
          <input
            type="date"
            value={currentDueFrom}
            onChange={(e) => updateParam('dueFrom', e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background/60 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Due To Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Due To</span>
          </label>
          <input
            type="date"
            value={currentDueTo}
            onChange={(e) => updateParam('dueTo', e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background/60 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>
    </div>
  );
};

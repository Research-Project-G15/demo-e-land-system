import { Clock, FileText, Activity } from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  logs: AuditLog[];
}

export function RecentActivity({ logs }: RecentActivityProps) {
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (recentLogs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm">No activity logs yet</p>
          <p className="text-xs mt-1">Activity will appear here once deeds are registered</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              log.action === 'CREATE' 
                ? "bg-success/10 text-success" 
                : log.action === 'UPDATE' 
                  ? "bg-warning/10 text-warning"
                  : log.action === 'DELETE'
                    ? "bg-destructive/10 text-destructive"
                    : "bg-blue-500/10 text-blue-500"
            )}>
              <Activity className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-foreground truncate">
                  {log.action}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {log.details}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                User: {log.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

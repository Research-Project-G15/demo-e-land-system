import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { StoredDeed } from '@/lib/hashUtils';
import { formatHashShort } from '@/lib/hashUtils';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  deeds: StoredDeed[];
}

export function RecentActivity({ deeds }: RecentActivityProps) {
  const recentDeeds = [...deeds]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recentDeeds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm">No deed records yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentDeeds.map((deed) => (
          <div
            key={deed.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              deed.isVerified 
                ? "bg-success/10 text-success" 
                : deed.isVerified === false 
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
            )}>
              {deed.isVerified ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : deed.isVerified === false ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {deed.deedNumber}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {deed.ownerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-muted-foreground">
                {formatHashShort(deed.generatedHash)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(deed.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

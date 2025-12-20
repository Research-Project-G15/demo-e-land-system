import { getAllOnChainRecords, formatHashShort } from '@/lib/hashUtils';
import { Link2, Hash, Clock, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BlockchainRegistry() {
  const records = getAllOnChainRecords();

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          No On-Chain Records
        </h3>
        <p className="text-sm text-muted-foreground">
          Register a deed to see it appear in the blockchain registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <div
          key={record.deedId}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-lg",
            "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary before:to-accent"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Block Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Block</p>
                <p className="font-display text-xl font-bold text-foreground">
                  #{record.blockNumber}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-12 w-px bg-border" />

            {/* Deed ID */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Deed ID
                </span>
              </div>
              <p className="font-mono text-sm font-medium text-foreground">
                {record.deedId}
              </p>
            </div>

            {/* Hash */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Stored Hash
                </span>
              </div>
              <p className="font-mono text-sm text-foreground">
                {formatHashShort(record.hash)}
              </p>
            </div>

            {/* Timestamp */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Timestamp
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(record.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Full Hash on Hover */}
          <div className="mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-xs text-muted-foreground mb-1">Full Hash:</p>
            <p className="font-mono text-xs text-foreground break-all">
              {record.hash}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

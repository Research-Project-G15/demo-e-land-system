import { Database, Link2, Shield, ArrowRight, ArrowDown, Hash } from 'lucide-react';

export function SystemDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold text-foreground mb-6">System Architecture</h3>
      
      <div className="relative">
        {/* Flow diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Off-Chain Database */}
          <div className="flex flex-col items-center">
            <div className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Database className="h-6 w-6 text-primary" />
                <span className="font-medium text-foreground">Off-Chain Database</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="p-2 rounded bg-background border border-border">
                  Deed Number, Owner Info
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  Land Details, Location
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  Transaction History
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center h-12">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex md:hidden items-center justify-center h-8">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          {/* Hash Generation */}
          <div className="flex flex-col items-center">
            <div className="w-full p-4 rounded-xl border-2 border-accent bg-accent/5">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Hash className="h-6 w-6 text-accent" />
                <span className="font-medium text-foreground">Hash Generation</span>
              </div>
              <div className="text-center space-y-2">
                <div className="p-2 rounded bg-background border border-border text-xs text-muted-foreground">
                  SHA-256 Algorithm
                </div>
                <div className="font-mono text-xs p-2 rounded bg-accent/10 text-accent break-all">
                  a7f3b2c4...9e8d1f0a
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique fingerprint from all deed data
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center h-12">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex md:hidden items-center justify-center h-8">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          {/* On-Chain Registry */}
          <div className="flex flex-col items-center">
            <div className="w-full p-4 rounded-xl border-2 border-success bg-success/5">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Link2 className="h-6 w-6 text-success" />
                <span className="font-medium text-foreground">On-Chain Registry</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-background border border-border flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Immutable Hash Storage</span>
                </div>
                <div className="p-2 rounded bg-background border border-border text-muted-foreground">
                  Block #1001 - Hash Stored
                </div>
                <p className="text-center text-muted-foreground">
                  Tamper-proof verification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            <span className="text-success">✓ Data matches hash</span> = Verified &nbsp;|&nbsp;
            <span className="text-destructive">✗ Data changed</span> = Tampering Detected
          </p>
        </div>
      </div>
    </div>
  );
}

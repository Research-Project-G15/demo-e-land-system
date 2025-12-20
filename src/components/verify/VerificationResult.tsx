import { CheckCircle2, XCircle, Hash, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationResultProps {
  isValid: boolean;
  currentHash: string;
  storedHash: string;
  deedNumber?: string;
}

export function VerificationResult({ isValid, currentHash, storedHash, deedNumber }: VerificationResultProps) {
  return (
    <div className={cn(
      "rounded-xl border-2 p-6 animate-fade-in",
      isValid 
        ? "border-success bg-success/5" 
        : "border-destructive bg-destructive/5"
    )}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          isValid ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
        )}>
          {isValid ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>
        <div>
          <h3 className={cn(
            "font-display text-2xl font-bold",
            isValid ? "text-success" : "text-destructive"
          )}>
            {isValid ? 'Verification Passed' : 'Verification Failed'}
          </h3>
          <p className="text-muted-foreground">
            {isValid 
              ? 'Data integrity confirmed. The deed has not been tampered with.'
              : 'Data tampering detected. The deed data has been modified.'}
          </p>
          {deedNumber && (
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Deed: {deedNumber}
            </p>
          )}
        </div>
      </div>

      {/* Hash Comparison */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          Hash Comparison
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          {/* Stored Hash */}
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Stored Hash (On-Chain)
              </span>
            </div>
            <p className="font-mono text-xs text-foreground break-all leading-relaxed">
              {storedHash}
            </p>
          </div>

          {/* Comparison Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <div className={cn(
              "p-2 rounded-full",
              isValid ? "bg-success/20" : "bg-destructive/20"
            )}>
              {isValid ? (
                <CheckCircle2 className={cn("h-5 w-5", isValid ? "text-success" : "text-destructive")} />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
            </div>
          </div>

          {/* Current Hash */}
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Hash (Computed)
              </span>
            </div>
            <p className={cn(
              "font-mono text-xs break-all leading-relaxed",
              isValid ? "text-foreground" : "text-destructive"
            )}>
              {currentHash}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className={cn(
          "p-4 rounded-lg text-sm",
          isValid ? "bg-success/10" : "bg-destructive/10"
        )}>
          {isValid ? (
            <p className="text-success">
              <strong>✓ Match Confirmed:</strong> The hash computed from the current deed data 
              matches the hash stored on the blockchain. This proves the data has not been 
              altered since registration.
            </p>
          ) : (
            <p className="text-destructive">
              <strong>✗ Mismatch Detected:</strong> The hash computed from the current deed data 
              does not match the on-chain hash. This indicates that one or more fields in the 
              database have been modified after the original registration.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

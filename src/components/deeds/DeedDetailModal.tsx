import { StoredDeed } from '@/lib/hashUtils';
import { formatHashShort, getOnChainRecord } from '@/lib/hashUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  User, 
  MapPin, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Link2,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeedDetailModalProps {
  deed: StoredDeed | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeedDetailModal({ deed, isOpen, onClose }: DeedDetailModalProps) {
  if (!deed) return null;

  const onChainRecord = getOnChainRecord(deed.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Deed Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={cn(
            "p-4 rounded-lg flex items-center gap-3",
            deed.isVerified 
              ? "bg-success/10 border border-success/30" 
              : "bg-destructive/10 border border-destructive/30"
          )}>
            {deed.isVerified ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <div>
              <p className={cn(
                "font-semibold",
                deed.isVerified ? "text-success" : "text-destructive"
              )}>
                {deed.isVerified ? 'Data Integrity Verified' : 'Data Tampering Detected'}
              </p>
              <p className="text-sm text-muted-foreground">
                {deed.isVerified 
                  ? 'The current data matches the on-chain hash.' 
                  : 'The data has been modified and no longer matches the stored hash.'}
              </p>
            </div>
          </div>

          {/* Deed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Deed Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deed Number</span>
                  <span className="font-mono font-medium text-foreground">{deed.deedNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Survey Plan</span>
                  <span className="font-mono text-foreground">{deed.surveyPlanNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration Date</span>
                  <span className="text-foreground">{new Date(deed.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notary</span>
                  <span className="text-foreground">{deed.notaryName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-primary" />
                Owner Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner Name</span>
                  <span className="font-medium text-foreground">{deed.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIC</span>
                  <span className="font-mono text-foreground">{deed.ownerNIC}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Owner</span>
                  <span className="text-foreground">{deed.previousOwner || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Land Details */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Land Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Location</span>
                <p className="font-medium text-foreground">{deed.landLocation}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Extent</span>
                <p className="font-medium text-foreground">{deed.landExtent}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">District</span>
                <p className="font-medium text-foreground">{deed.district}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">DS Division</span>
                <p className="font-medium text-foreground">{deed.divisionalSecretariat}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 md:col-span-2">
                <span className="text-muted-foreground">GN Division</span>
                <p className="font-medium text-foreground">{deed.gramaNiladhariDivision}</p>
              </div>
            </div>
          </div>

          {/* Hash Information */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold flex items-center gap-2 text-foreground">
              <Hash className="h-4 w-4 text-accent" />
              Cryptographic Verification
            </h4>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Stored Hash (SHA-256)
                </span>
                <p className="font-mono text-sm text-foreground break-all mt-1">
                  {deed.generatedHash}
                </p>
              </div>
              {onChainRecord && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Block #{onChainRecord.blockNumber}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {new Date(onChainRecord.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Created: {new Date(deed.createdAt).toLocaleString()}
            </div>
            {deed.lastVerified && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Last Verified: {new Date(deed.lastVerified).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

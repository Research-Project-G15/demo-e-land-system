import { useState } from 'react';
import { StoredDeed } from '@/lib/hashUtils';
import { formatHashShort, verifyDeedIntegrity } from '@/lib/hashUtils';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Hash,
  Shield,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeedCardProps {
  deed: StoredDeed;
  onView?: (deed: StoredDeed) => void;
  onEdit?: (deed: StoredDeed) => void;
  onVerify?: (deed: StoredDeed) => void;
}

export function DeedCard({ deed, onView, onEdit, onVerify }: DeedCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!onVerify) return;
    setIsVerifying(true);
    await onVerify(deed);
    setIsVerifying(false);
  };

  const getStatusIcon = () => {
    if (deed.isVerified === true) {
      return <CheckCircle2 className="h-5 w-5" />;
    } else if (deed.isVerified === false) {
      return <XCircle className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  const getStatusColor = () => {
    if (deed.isVerified === true) return 'text-success bg-success/10';
    if (deed.isVerified === false) return 'text-destructive bg-destructive/10';
    return 'text-warning bg-warning/10';
  };

  const getStatusText = () => {
    if (deed.isVerified === true) return 'Verified';
    if (deed.isVerified === false) return 'Tampered';
    return 'Pending';
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Status Badge */}
      <div className={cn(
        "absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
        getStatusColor()
      )}>
        {getStatusIcon()}
        {getStatusText()}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-primary font-medium">{deed.deedNumber}</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
            {deed.ownerName}
          </h3>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{deed.landLocation}, {deed.district}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span>NIC: {deed.ownerNIC}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Extent: {deed.landExtent}</span>
          </div>
        </div>

        {/* Hash Display */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Deed Hash (On-Chain ID)</span>
          </div>
          <p className="font-mono text-xs text-foreground break-all">
            {formatHashShort(deed.generatedHash)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(deed)} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(deed)} className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onVerify && (
            <Button 
              variant="verify" 
              size="sm" 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="flex-1"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isVerifying && "animate-spin")} />
              Verify
            </Button>
          )}
        </div>
      </div>

      {/* Subtle hover gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

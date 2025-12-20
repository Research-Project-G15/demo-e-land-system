import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { VerificationResult } from '@/components/verify/VerificationResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllDeeds, verifyDeed, initializeSampleData } from '@/lib/deedStorage';
import { StoredDeed } from '@/lib/hashUtils';
import { toast } from 'sonner';
import { 
  Search, 
  FileSearch, 
  Shield, 
  Hash,
  ChevronRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VerifyPage = () => {
  const [deeds, setDeeds] = useState<StoredDeed[]>([]);
  const [selectedDeedId, setSelectedDeedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    currentHash: string;
    storedHash: string;
    deedNumber: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await initializeSampleData();
      setDeeds(getAllDeeds());
    };
    loadData();
  }, []);

  const filteredDeeds = deeds.filter(deed =>
    deed.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deed.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = async () => {
    if (!selectedDeedId) {
      toast.error('Please select a deed to verify');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Simulate processing delay for effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await verifyDeed(selectedDeedId);
      const deed = deeds.find(d => d.id === selectedDeedId);
      
      setVerificationResult({
        ...result,
        deedNumber: deed?.deedNumber || ''
      });

      // Update deeds list
      setDeeds(getAllDeeds());
    } catch (error) {
      toast.error('Verification failed');
    }

    setIsVerifying(false);
  };

  const selectedDeed = deeds.find(d => d.id === selectedDeedId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <FileSearch className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Verify Deed Integrity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a deed to verify its data integrity. The system will recompute the hash 
            from current data and compare it with the on-chain stored hash.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Selection Card */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-card mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Select Deed to Verify
            </h2>

            <div className="space-y-4">
              {/* Search Filter */}
              <div>
                <Label htmlFor="search">Search Deeds</Label>
                <Input
                  id="search"
                  placeholder="Type deed number or owner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              {/* Deed Selection */}
              <div>
                <Label htmlFor="deed-select">Select Deed</Label>
                <Select value={selectedDeedId} onValueChange={setSelectedDeedId}>
                  <SelectTrigger className="mt-1.5 h-12">
                    <SelectValue placeholder="Choose a deed to verify..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDeeds.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No deeds found
                      </div>
                    ) : (
                      filteredDeeds.map((deed) => (
                        <SelectItem key={deed.id} value={deed.id}>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">{deed.deedNumber}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{deed.ownerName}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Deed Preview */}
              {selectedDeed && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Owner:</span>
                      <p className="font-medium text-foreground">{selectedDeed.ownerName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">District:</span>
                      <p className="font-medium text-foreground">{selectedDeed.district}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5" /> Stored Hash:
                      </span>
                      <p className="font-mono text-xs text-foreground break-all mt-1">
                        {selectedDeed.generatedHash}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <Button
                variant="hero"
                size="xl"
                className="w-full mt-4"
                onClick={handleVerify}
                disabled={!selectedDeedId || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Data Integrity
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <VerificationResult
              isValid={verificationResult.isValid}
              currentHash={verificationResult.currentHash}
              storedHash={verificationResult.storedHash}
              deedNumber={verificationResult.deedNumber}
            />
          )}

          {/* Info Card */}
          <div className="mt-8 p-6 rounded-xl border border-border bg-muted/30">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">
              How Verification Works
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">1</span>
                The system retrieves the deed data from the off-chain database.
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">2</span>
                A SHA-256 hash is computed from all current data fields.
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">3</span>
                The computed hash is compared with the hash stored on-chain.
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">4</span>
                If hashes match → data is valid. If different → tampering detected.
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyPage;

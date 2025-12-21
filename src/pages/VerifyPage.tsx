import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLand, getDeed, getOwnershipHistory, getOwner, transferOwnership } from '@/lib/deedStorage';
import { Land, Deed, Owner } from '@/lib/types';
import { Search, MapPin, FileText, History, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DeedForm } from '@/components/deeds/DeedForm';
import { useToast } from '@/components/ui/use-toast';

const VerifyPage = () => {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<'land' | 'deed'>('land');
  const [searchQuery, setSearchQuery] = useState('');
  const [landResult, setLandResult] = useState<{ land: Land, history: Deed[] } | null>(null);
  const [deedResult, setDeedResult] = useState<{ deed: Deed, owner: Owner | undefined, land: Land | undefined } | null>(null);
  const [error, setError] = useState('');
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLandResult(null);
    setDeedResult(null);

    if (!searchQuery.trim()) return;

    if (searchType === 'land') {
      const land = getLand(searchQuery);
      if (land) {
        const history = getOwnershipHistory(searchQuery);
        setLandResult({ land, history });
      } else {
        setError(`Land with number ${searchQuery} not found.`);
      }
    } else {
      const deed = getDeed(searchQuery);
      if (deed) {
        const owner = getOwner(deed.ownerNic);
        const land = getLand(deed.landNumber);
        setDeedResult({ deed, owner, land });
      } else {
        setError(`Deed with number ${searchQuery} not found.`);
      }
    }
  };

  const handleTransfer = async (data: Deed) => {
    if (!deedResult) return;
    try {
      // We need to omit status and previousDeedNumber as they are handled by transferOwnership
      const { status, previousDeedNumber, ...transferData } = data;
      transferOwnership(deedResult.deed.deedNumber, transferData);
      toast({
        title: "Success",
        description: `Ownership transferred to new deed ${data.deedNumber}.`,
      });
      setIsTransferOpen(false);
      // Refresh search result
      const updatedDeed = getDeed(deedResult.deed.deedNumber); // This will be the OLD deed, now TRANSFERRED
      if (updatedDeed) {
         const owner = getOwner(updatedDeed.ownerNic);
         const land = getLand(updatedDeed.landNumber);
         setDeedResult({ deed: updatedDeed, owner, land });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Search
          </h1>
          <p className="text-muted-foreground">
            Search for land records and deed information.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <Tabs defaultValue="land" onValueChange={(v) => setSearchType(v as 'land' | 'deed')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="land">Search by Land Number</TabsTrigger>
              <TabsTrigger value="deed">Search by Deed Number</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={searchType === 'land' ? "Enter Land Number (e.g. L001)" : "Enter Deed Number (e.g. D001)"}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </Tabs>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {landResult && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Land Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Land Number</Label>
                  <div className="font-medium">{landResult.land.landNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">District</Label>
                  <div className="font-medium">{landResult.land.district}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Division</Label>
                  <div className="font-medium">{landResult.land.division}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Area</Label>
                  <div className="font-medium">{landResult.land.area}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Map Reference</Label>
                  <div className="font-medium">{landResult.land.mapReference}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Ownership History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Deed Number</TableHead>
                      <TableHead>Owner NIC</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {landResult.history.map((deed) => (
                      <TableRow key={deed.deedNumber}>
                        <TableCell>{new Date(deed.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                        <TableCell>{deed.ownerNic}</TableCell>
                        <TableCell>{deed.deedType}</TableCell>
                        <TableCell>
                          <Badge variant={deed.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {deed.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {landResult.history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No history found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {deedResult && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Deed Information
                </CardTitle>
                {deedResult.deed.status === 'ACTIVE' && (
                  <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Transfer Ownership
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Transfer Ownership</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Create a new deed to transfer ownership from the current owner.
                          The current deed ({deedResult.deed.deedNumber}) will be marked as TRANSFERRED.
                        </p>
                        <DeedForm 
                          onSubmit={handleTransfer} 
                          onCancel={() => setIsTransferOpen(false)}
                          initialData={{ landNumber: deedResult.deed.landNumber }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Deed Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Deed Number</Label>
                      <div className="font-medium">{deedResult.deed.deedNumber}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registration Date</Label>
                      <div className="font-medium">{new Date(deedResult.deed.registrationDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <div className="font-medium">{deedResult.deed.deedType}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div>
                        <Badge variant={deedResult.deed.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {deedResult.deed.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Owner Details</h4>
                  {deedResult.owner ? (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <div className="font-medium">{deedResult.owner.fullName}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">NIC</Label>
                        <div className="font-medium">{deedResult.owner.nic}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-destructive">Owner information not found.</div>
                  )}
                </div>

                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Land Details</h4>
                  {deedResult.land ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Land Number</Label>
                        <div className="font-medium">{deedResult.land.landNumber}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">District</Label>
                        <div className="font-medium">{deedResult.land.district}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Area</Label>
                        <div className="font-medium">{deedResult.land.area}</div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Map Ref</Label>
                        <div className="font-medium">{deedResult.land.mapReference}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-destructive">Land information not found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyPage;

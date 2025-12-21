import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDeed, searchDeeds, getAllDeeds } from '@/lib/deedStorage';
import { Deed } from '@/lib/types';
import { Search, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VerifyPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setDeeds(searchDeeds(searchQuery));
    } else {
      setDeeds(getAllDeeds());
    }
  }, [searchQuery]);

  const handleViewDetails = (deed: Deed) => {
    setSelectedDeed(deed);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Search Deeds
          </h1>
          <p className="text-muted-foreground">
            Search for deed records by Deed Number or Owner NIC.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Enter Deed Number or Owner NIC..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deed Number</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Owner NIC</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deeds.map((deed) => (
                  <TableRow key={deed.deedNumber}>
                    <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                    <TableCell>{deed.owner.fullName}</TableCell>
                    <TableCell>{deed.owner.nic}</TableCell>
                    <TableCell>{deed.land.district}</TableCell>
                    <TableCell>
                      <Badge variant={deed.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {deed.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(deed)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {deeds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchQuery ? 'No deeds found matching your search.' : 'No deeds registered yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Deed Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deed Details</DialogTitle>
            </DialogHeader>
            {selectedDeed && (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Deed Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Deed Number</Label>
                      <div className="font-medium">{selectedDeed.deedNumber}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Survey Plan Number</Label>
                      <div className="font-medium">{selectedDeed.surveyPlanNumber}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registration Date</Label>
                      <div className="font-medium">{new Date(selectedDeed.registrationDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Notary Name</Label>
                      <div className="font-medium">{selectedDeed.notaryName}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div>
                        <Badge variant={selectedDeed.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {selectedDeed.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Owner Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Owner Full Name</Label>
                      <div className="font-medium">{selectedDeed.owner.fullName}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Owner NIC</Label>
                      <div className="font-medium">{selectedDeed.owner.nic}</div>
                    </div>
                    {selectedDeed.owner.previousOwner && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Previous Owner</Label>
                        <div className="font-medium">{selectedDeed.owner.previousOwner}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Land Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Land Extent</Label>
                      <div className="font-medium">{selectedDeed.land.landExtent}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Land Location</Label>
                      <div className="font-medium">{selectedDeed.land.landLocation}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">District</Label>
                      <div className="font-medium">{selectedDeed.land.district}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Divisional Secretariat</Label>
                      <div className="font-medium">{selectedDeed.land.divisionalSecretariat}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Grama Niladhari Division</Label>
                      <div className="font-medium">{selectedDeed.land.gramaNiladhariDivision}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default VerifyPage;
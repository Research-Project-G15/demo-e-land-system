import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getAllOwners, registerLand, registerDeed, getAllDeeds, getLand } from '@/lib/deedStorage';
import { Land, Owner, Deed } from '@/lib/types';
import { MapPin, User, FileText, Search, CheckCircle2, Save, Plus, List } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DeedsPage = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [landData, setLandData] = useState<Land>({
    landNumber: '',
    district: '',
    division: '',
    area: '',
    areaUnit: 'Perches',
    mapReference: '',
  });

  const [deedData, setDeedData] = useState({
    deedNumber: '',
    deedType: 'Sale',
    registrationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (ownerSearchQuery) {
      setFilteredOwners(owners.filter(o => 
        o.nic.toLowerCase().includes(ownerSearchQuery.toLowerCase()) ||
        o.fullName.toLowerCase().includes(ownerSearchQuery.toLowerCase())
      ));
    } else {
      setFilteredOwners([]);
    }
  }, [ownerSearchQuery, owners]);

  const loadData = () => {
    setDeeds(getAllDeeds());
    setOwners(getAllOwners());
  };

  const generateDeedId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `DEED-${timestamp}-${random}`;
  };

  const handleLandChange = (field: keyof Land) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLandData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setLandData({
      landNumber: '',
      district: '',
      division: '',
      area: '',
      areaUnit: 'Perches',
      mapReference: '',
    });
    setDeedData({
      deedNumber: '',
      deedType: 'Sale',
      registrationDate: new Date().toISOString().split('T')[0],
    });
    setSelectedOwner(null);
    setOwnerSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!landData.landNumber || !landData.district || !landData.division || !landData.area || !landData.mapReference) {
        throw new Error("Please fill in all land details.");
      }
      if (!selectedOwner) {
        throw new Error("Please select an owner.");
      }
      if (!deedData.deedType) {
        throw new Error("Please select a deed type.");
      }

      // Register land (ignore if exists)
      try {
        registerLand(landData);
      } catch (e) {
        console.log("Land might already exist", e);
      }

      // Register deed
      const finalDeed: Deed = {
        deedNumber: deedData.deedNumber || generateDeedId(),
        landNumber: landData.landNumber,
        ownerNic: selectedOwner.nic,
        registrationDate: deedData.registrationDate,
        deedType: deedData.deedType,
        status: 'ACTIVE',
      };

      registerDeed(finalDeed);

      toast({
        title: "Success",
        description: `Deed ${finalDeed.deedNumber} registered successfully.`,
      });

      resetForm();
      setShowForm(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <main className="container py-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Deed Records
            </h1>
            <p className="text-muted-foreground">
              Register and manage land deeds.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <List className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'View Records' : 'Register New Deed'}
          </Button>
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Register New Deed
              </CardTitle>
              <CardDescription>
                Fill in the details to register a new land deed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Land Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Land Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landNumber">Land Number *</Label>
                      <Input 
                        id="landNumber" 
                        value={landData.landNumber} 
                        onChange={handleLandChange('landNumber')} 
                        placeholder="e.g., L001" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input 
                        id="district" 
                        value={landData.district} 
                        onChange={handleLandChange('district')} 
                        placeholder="e.g., Colombo" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="division">Division *</Label>
                      <Input 
                        id="division" 
                        value={landData.division} 
                        onChange={handleLandChange('division')} 
                        placeholder="e.g., Colombo 01" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area *</Label>
                      <Input 
                        id="area" 
                        value={landData.area} 
                        onChange={handleLandChange('area')} 
                        placeholder="e.g., 10.5" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaUnit">Area Unit</Label>
                      <Input 
                        id="areaUnit" 
                        value={landData.areaUnit} 
                        onChange={handleLandChange('areaUnit')} 
                        placeholder="e.g., Perches" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mapReference">Map Reference *</Label>
                      <Input 
                        id="mapReference" 
                        value={landData.mapReference} 
                        onChange={handleLandChange('mapReference')} 
                        placeholder="e.g., M-101" 
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Owner Information
                  </h3>
                  <div className="space-y-2">
                    <Label>Search Owner by NIC or Name</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter NIC or name..."
                        className="pl-9"
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                      />
                    </div>
                    {filteredOwners.length > 0 && (
                      <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                        {filteredOwners.map(owner => (
                          <div 
                            key={owner.nic} 
                            className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setSelectedOwner(owner);
                              setOwnerSearchQuery(owner.nic);
                              setFilteredOwners([]);
                            }}
                          >
                            <span>{owner.fullName} ({owner.nic})</span>
                            {selectedOwner?.nic === owner.nic && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedOwner && (
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Selected Owner
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{selectedOwner.fullName}</span>
                        <span className="text-muted-foreground">NIC:</span>
                        <span>{selectedOwner.nic}</span>
                        <span className="text-muted-foreground">Address:</span>
                        <span>{selectedOwner.address}</span>
                        <span className="text-muted-foreground">Contact:</span>
                        <span>{selectedOwner.contactNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deed Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Deed Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deedNumber">Deed Number (Optional)</Label>
                      <Input 
                        id="deedNumber" 
                        value={deedData.deedNumber} 
                        onChange={(e) => setDeedData(prev => ({ ...prev, deedNumber: e.target.value }))}
                        placeholder="Auto-generated if empty" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deedType">Deed Type *</Label>
                      <Select 
                        value={deedData.deedType} 
                        onValueChange={(value) => setDeedData(prev => ({ ...prev, deedType: value }))}
                      >
                        <SelectTrigger id="deedType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sale">Sale</SelectItem>
                          <SelectItem value="Gift">Gift</SelectItem>
                          <SelectItem value="Inheritance">Inheritance</SelectItem>
                          <SelectItem value="Exchange">Exchange</SelectItem>
                          <SelectItem value="Donation">Donation</SelectItem>
                          <SelectItem value="Partition">Partition</SelectItem>
                          <SelectItem value="Lease">Lease</SelectItem>
                          <SelectItem value="Mortgage">Mortgage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Registration Date *</Label>
                      <Input 
                        id="registrationDate" 
                        type="date" 
                        value={deedData.registrationDate} 
                        onChange={(e) => setDeedData(prev => ({ ...prev, registrationDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Registering...' : 'Register Deed'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Registered Deeds
              </CardTitle>
              <CardDescription>
                View all registered deed records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deed Number</TableHead>
                    <TableHead>Land Number</TableHead>
                    <TableHead>Owner NIC</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deeds.map((deed) => (
                    <TableRow key={deed.deedNumber}>
                      <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                      <TableCell>{deed.landNumber}</TableCell>
                      <TableCell>{deed.ownerNic}</TableCell>
                      <TableCell>{deed.deedType}</TableCell>
                      <TableCell>{new Date(deed.registrationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={deed.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {deed.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deeds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No deeds registered yet. Click "Register New Deed" to add one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DeedsPage;
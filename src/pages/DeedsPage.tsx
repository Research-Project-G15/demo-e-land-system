import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { registerDeed, getAllDeeds, searchDeeds, initializeSampleData } from '@/lib/deedStorage';
import { Land, Owner, Deed } from '@/lib/types';
import { MapPin, User, FileText, Save, Plus, List, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DeedsPage = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [deedNumber, setDeedNumber] = useState('');
  const [surveyPlanNumber, setSurveyPlanNumber] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notaryName, setNotaryName] = useState('');

  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerNic, setOwnerNic] = useState('');
  const [previousOwner, setPreviousOwner] = useState('');

  const [landExtent, setLandExtent] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [divisionalSecretariat, setDivisionalSecretariat] = useState('');
  const [gramaNiladhariDivision, setGramaNiladhariDivision] = useState('');

  useEffect(() => {
    initializeSampleData();
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setDeeds(searchDeeds(searchQuery));
    } else {
      setDeeds(getAllDeeds());
    }
  }, [searchQuery]);

  const loadData = () => {
    setDeeds(getAllDeeds());
  };

  const resetForm = () => {
    setDeedNumber('');
    setSurveyPlanNumber('');
    setRegistrationDate(new Date().toISOString().split('T')[0]);
    setNotaryName('');
    setOwnerFullName('');
    setOwnerNic('');
    setPreviousOwner('');
    setLandExtent('');
    setLandLocation('');
    setDistrict('');
    setDivisionalSecretariat('');
    setGramaNiladhariDivision('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!deedNumber || !surveyPlanNumber || !registrationDate || !notaryName) {
        throw new Error("Please fill in all deed information fields.");
      }
      if (!ownerFullName || !ownerNic) {
        throw new Error("Please fill in owner full name and NIC.");
      }
      if (!landExtent || !landLocation || !district || !divisionalSecretariat || !gramaNiladhariDivision) {
        throw new Error("Please fill in all land details.");
      }

      const owner: Owner = {
        fullName: ownerFullName,
        nic: ownerNic,
        previousOwner: previousOwner || undefined,
      };

      const land: Land = {
        landExtent,
        landLocation,
        district,
        divisionalSecretariat,
        gramaNiladhariDivision,
      };

      const deed: Deed = {
        deedNumber,
        surveyPlanNumber,
        registrationDate,
        notaryName,
        owner,
        land,
        status: 'ACTIVE',
      };

      registerDeed(deed);

      toast({
        title: "Success",
        description: `Deed ${deedNumber} registered successfully.`,
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
                {/* Deed Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Deed Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deedNumber">Deed Number *</Label>
                      <Input 
                        id="deedNumber" 
                        value={deedNumber} 
                        onChange={(e) => setDeedNumber(e.target.value)} 
                        placeholder="e.g., D-2024-001" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surveyPlanNumber">Survey Plan Number *</Label>
                      <Input 
                        id="surveyPlanNumber" 
                        value={surveyPlanNumber} 
                        onChange={(e) => setSurveyPlanNumber(e.target.value)} 
                        placeholder="e.g., SP-1234" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Registration Date *</Label>
                      <Input 
                        id="registrationDate" 
                        type="date" 
                        value={registrationDate} 
                        onChange={(e) => setRegistrationDate(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notaryName">Notary Name *</Label>
                      <Input 
                        id="notaryName" 
                        value={notaryName} 
                        onChange={(e) => setNotaryName(e.target.value)} 
                        placeholder="e.g., Mr. K. Silva" 
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerFullName">Owner Full Name *</Label>
                      <Input 
                        id="ownerFullName" 
                        value={ownerFullName} 
                        onChange={(e) => setOwnerFullName(e.target.value)} 
                        placeholder="e.g., John Perera" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerNic">Owner NIC *</Label>
                      <Input 
                        id="ownerNic" 
                        value={ownerNic} 
                        onChange={(e) => setOwnerNic(e.target.value)} 
                        placeholder="e.g., 123456789V" 
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="previousOwner">Previous Owner</Label>
                      <Input 
                        id="previousOwner" 
                        value={previousOwner} 
                        onChange={(e) => setPreviousOwner(e.target.value)} 
                        placeholder="e.g., James Fernando (optional)" 
                      />
                    </div>
                  </div>
                </div>

                {/* Land Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Land Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landExtent">Land Extent *</Label>
                      <Input 
                        id="landExtent" 
                        value={landExtent} 
                        onChange={(e) => setLandExtent(e.target.value)} 
                        placeholder="e.g., 10 Perches" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landLocation">Land Location *</Label>
                      <Input 
                        id="landLocation" 
                        value={landLocation} 
                        onChange={(e) => setLandLocation(e.target.value)} 
                        placeholder="e.g., Kollupitiya" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input 
                        id="district" 
                        value={district} 
                        onChange={(e) => setDistrict(e.target.value)} 
                        placeholder="e.g., Colombo" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="divisionalSecretariat">Divisional Secretariat *</Label>
                      <Input 
                        id="divisionalSecretariat" 
                        value={divisionalSecretariat} 
                        onChange={(e) => setDivisionalSecretariat(e.target.value)} 
                        placeholder="e.g., Colombo" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gramaNiladhariDivision">Grama Niladhari Division *</Label>
                      <Input 
                        id="gramaNiladhariDivision" 
                        value={gramaNiladhariDivision} 
                        onChange={(e) => setGramaNiladhariDivision(e.target.value)} 
                        placeholder="e.g., Kollupitiya West" 
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-primary" />
                    Registered Deeds
                  </CardTitle>
                  <CardDescription>
                    View all registered deed records.
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Deed Number or Owner NIC..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deed Number</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Owner NIC</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deeds.map((deed) => (
                    <TableRow key={deed.deedNumber}>
                      <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                      <TableCell>{deed.owner.fullName}</TableCell>
                      <TableCell>{deed.owner.nic}</TableCell>
                      <TableCell>{deed.land.district}</TableCell>
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
                        {searchQuery ? 'No deeds found matching your search.' : 'No deeds registered yet. Click "Register New Deed" to add one.'}
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
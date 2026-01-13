import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { getDeed, updateDeed, getOwner, registerOwner } from '@/lib/deedStorage';
import { Deed, Owner } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

const EditDeedPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [deedData, setDeedData] = useState<Deed>({
    deedNumber: '',
    landNumber: '',
    ownerNic: '',
    registrationDate: '',
    deedType: '',
    status: 'ACTIVE'
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    nic: '',
    fullName: '',
    address: '',
    contactNumber: ''
  });

  useEffect(() => {
    const loadDeed = async () => {
      if (!deedNumber) return;
      try {
        const deed = await getDeed(deedNumber);
        if (!deed) {
          toast({ title: "Error", description: "Deed not found", variant: "destructive" });
          navigate('/verify');
          return;
        }
        setDeedData(deed);

        const owner = await getOwner(deed.ownerNic);
        if (owner) {
          setOwnerData(owner);
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to load details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadDeed();
  }, [deedNumber, navigate, toast]);

  const handleDeedChange = (field: keyof Deed) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeedData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleOwnerChange = (field: keyof Owner) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Check if owner exists, if not register (or update? assuming update for now implies consistency)
      // If NIC changed, checking if new owner exists.
      // If NIC same, we might want to update owner details too? 
      // Current requirement: "Edit create this function". 
      // I'll assume we update the owner record if it exists, or create if new NIC.
      // API for updating owner doesn't exist explicitly in my previous reads, only registerOwner.
      // For simplicity: If owner exists, we don't update their details via this form (separation of concerns), 
      // UNLESS user specifically wants to fix owner details. 
      // I'll try to register owner if not exists.
      
      const existingOwner = await getOwner(ownerData.nic);
      if (!existingOwner) {
        await registerOwner(ownerData, user?.username);
      }

      await updateDeed({
        ...deedData,
        ownerNic: ownerData.nic
      }, user?.username);

      toast({ title: "Success", description: "Deed updated successfully" });
      navigate('/verify');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate('/verify')} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Verify
            </Button>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Edit Deed
            </h1>
            <p className="text-muted-foreground">
            Editing Deed: <span className="font-mono font-medium text-foreground">{deedData.deedNumber}</span>
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Deed Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Deed Number</Label>
                        <Input value={deedData.deedNumber} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <Label>Deed Type</Label>
                        <Select value={deedData.deedType} onValueChange={(val) => setDeedData(prev => ({ ...prev, deedType: val }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select deed type" />
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
                                 {/* Fallback for existing values not in list to ensure they are displayed */}
                                {!['Sale', 'Gift', 'Inheritance', 'Exchange', 'Donation', 'Partition', 'Lease', 'Mortgage'].includes(deedData.deedType) && deedData.deedType && (
                                    <SelectItem value={deedData.deedType}>{deedData.deedType}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Registration Date</Label>
                        <Input type="date" value={deedData.registrationDate ? new Date(deedData.registrationDate).toISOString().split('T')[0] : ''} onChange={handleDeedChange('registrationDate')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={deedData.status} onValueChange={(val) => setDeedData(prev => ({ ...prev, status: val as any }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="TRANSFERRED">TRANSFERRED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Land Number</Label>
                        <Input value={deedData.landNumber} onChange={handleDeedChange('landNumber')} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Owner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>NIC</Label>
                        <Input value={ownerData.nic} onChange={handleOwnerChange('nic')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={ownerData.fullName} onChange={handleOwnerChange('fullName')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={ownerData.address} onChange={handleOwnerChange('address')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <Input value={ownerData.contactNumber} onChange={handleOwnerChange('contactNumber')} />
                    </div>
                </CardContent>
            </Card>

            <div className="md:col-span-2 flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/verify')}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                    <Save className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default EditDeedPage;

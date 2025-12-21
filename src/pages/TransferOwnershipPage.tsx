import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { DeedForm } from '@/components/deeds/DeedForm';
import { getDeed, transferOwnership, getOwner, registerOwner, getNextDeedId } from '@/lib/deedStorage';
import { Deed, Owner } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TransferOwnershipPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sourceDeed, setSourceDeed] = useState<Deed | null>(null);
  const [newDeedNumber, setNewDeedNumber] = useState('');

  useEffect(() => {
    const fetchDeed = async () => {
      if (deedNumber) {
        const deed = await getDeed(deedNumber);
        if (deed && deed.status === 'ACTIVE') {
          setSourceDeed(deed);
          // Generate new deed number based on previous deed ID
          const nextId = await getNextDeedId(deed.deedNumber);
          setNewDeedNumber(nextId);
        } else {
          toast({
            title: "Error",
            description: "Invalid or inactive deed number.",
            variant: "destructive",
          });
          navigate('/verify');
        }
      }
    };
    fetchDeed();
  }, [deedNumber, navigate, toast]);

  const handleTransfer = async (data: Deed, ownerData?: Owner) => {
    if (!sourceDeed) return;
    try {
      // Register owner if provided and doesn't exist
      if (ownerData && ownerData.nic) {
        const existingOwner = await getOwner(ownerData.nic);
        if (!existingOwner) {
            await registerOwner(ownerData);
        }
      }

      // We need to omit status and previousDeedNumber as they are handled by transferOwnership
      const { status, previousDeedNumber, ...transferData } = data;
      await transferOwnership(sourceDeed.deedNumber, transferData);
      toast({
        title: "Success",
        description: `Ownership transferred to new deed ${data.deedNumber}.`,
      });
      navigate('/verify');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!sourceDeed) return null;

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
            Transfer Ownership
          </h1>
          <p className="text-muted-foreground">
            Transfer ownership for Deed: <span className="font-mono font-medium text-foreground">{sourceDeed.deedNumber}</span>
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>New Owner Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Please provide the details for the new deed and owner. 
                The current deed ({sourceDeed.deedNumber}) will be marked as TRANSFERRED.
              </p>
              <DeedForm 
                onSubmit={handleTransfer} 
                onCancel={() => navigate('/verify')}
                initialData={{ 
                  landNumber: sourceDeed.landNumber,
                  deedNumber: newDeedNumber
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TransferOwnershipPage;

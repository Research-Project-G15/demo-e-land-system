import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DeedCard } from '@/components/deeds/DeedCard';
import { DeedForm } from '@/components/deeds/DeedForm';
import { DeedDetailModal } from '@/components/deeds/DeedDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllDeeds, createDeed, updateDeed, verifyDeed, initializeSampleData } from '@/lib/deedStorage';
import { StoredDeed, DeedData } from '@/lib/hashUtils';
import { toast } from 'sonner';
import { Plus, Search, Database, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DeedsPage = () => {
  const [deeds, setDeeds] = useState<StoredDeed[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDeed, setSelectedDeed] = useState<StoredDeed | null>(null);
  const [editingDeed, setEditingDeed] = useState<StoredDeed | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await initializeSampleData();
      setDeeds(getAllDeeds());
    };
    loadData();
  }, []);

  const filteredDeeds = deeds.filter(deed => 
    deed.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deed.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deed.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeed = async (data: DeedData) => {
    setIsLoading(true);
    try {
      await createDeed(data);
      setDeeds(getAllDeeds());
      setIsFormOpen(false);
      toast.success('Deed registered successfully', {
        description: 'Hash generated and stored on-chain.'
      });
    } catch (error) {
      toast.error('Failed to register deed');
    }
    setIsLoading(false);
  };

  const handleUpdateDeed = async (data: DeedData) => {
    if (!editingDeed) return;
    setIsLoading(true);
    try {
      await updateDeed(editingDeed.id, data);
      setDeeds(getAllDeeds());
      setEditingDeed(null);
      toast.warning('Deed data updated', {
        description: 'Note: This may cause verification to fail if data differs from original.'
      });
    } catch (error) {
      toast.error('Failed to update deed');
    }
    setIsLoading(false);
  };

  const handleVerify = async (deed: StoredDeed) => {
    try {
      const result = await verifyDeed(deed.id);
      setDeeds(getAllDeeds());
      
      if (result.isValid) {
        toast.success('Verification Passed', {
          description: 'Data integrity confirmed. No tampering detected.'
        });
      } else {
        toast.error('Verification Failed', {
          description: 'Data tampering detected! The deed data has been modified.'
        });
      }
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Deed Records
            </h1>
            <p className="text-muted-foreground">
              Manage and verify land deed registrations
            </p>
          </div>
          <Button variant="hero" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Register New Deed
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by deed number, owner name, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Deeds Grid */}
        {filteredDeeds.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Deeds Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'No deeds match your search criteria.' : 'Start by registering your first deed.'}
            </p>
            {!searchQuery && (
              <Button variant="hero" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Register First Deed
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeeds.map((deed) => (
              <DeedCard
                key={deed.id}
                deed={deed}
                onView={setSelectedDeed}
                onEdit={setEditingDeed}
                onVerify={handleVerify}
              />
            ))}
          </div>
        )}

        {/* Create Deed Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Register New Deed</DialogTitle>
            </DialogHeader>
            <DeedForm
              onSubmit={handleCreateDeed}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Deed Dialog */}
        <Dialog open={!!editingDeed} onOpenChange={(open) => !open && setEditingDeed(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit Deed (Simulates Data Tampering)</DialogTitle>
            </DialogHeader>
            <div className="p-4 mb-4 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning">
                <strong>Note:</strong> Editing deed data will cause verification to fail, 
                demonstrating how the system detects tampering.
              </p>
            </div>
            {editingDeed && (
              <DeedForm
                initialData={editingDeed}
                onSubmit={handleUpdateDeed}
                onCancel={() => setEditingDeed(null)}
                isLoading={isLoading}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <DeedDetailModal
          deed={selectedDeed}
          isOpen={!!selectedDeed}
          onClose={() => setSelectedDeed(null)}
        />
      </main>
    </div>
  );
};

export default DeedsPage;

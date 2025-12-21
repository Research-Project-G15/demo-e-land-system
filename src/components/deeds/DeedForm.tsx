import { useState, useEffect } from 'react';
import { Deed, Owner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, RefreshCw, User, Search, CheckCircle2 } from 'lucide-react';
import { getOwner, getAllOwners } from '@/lib/deedStorage';

export interface DeedFormProps {
  onSubmit: (data: Deed, ownerData?: Owner) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<Deed>;
}

export function DeedForm({ onSubmit, onCancel, isLoading = false, initialData }: DeedFormProps) {
  const [formData, setFormData] = useState<Deed>({
    deedNumber: '',
    landNumber: initialData?.landNumber || '',
    ownerNic: '',
    registrationDate: new Date().toISOString().split('T')[0],
    deedType: '',
    status: 'ACTIVE',
    ...initialData,
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    nic: '',
    fullName: '',
    address: '',
    contactNumber: '',
  });

  const [isExistingOwner, setIsExistingOwner] = useState(false);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allOwners, setAllOwners] = useState<Owner[]>([]);

  useEffect(() => {
    const loadOwners = async () => {
      const owners = await getAllOwners();
      setAllOwners(owners);
    };
    loadOwners();
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure we don't overwrite with undefined if initialData has missing keys
        deedNumber: initialData.deedNumber || prev.deedNumber,
        landNumber: initialData.landNumber || prev.landNumber,
      }));
    }
  }, [initialData]);

  const generateDeedId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newId = `DEED-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, deedNumber: newId }));
  };

  const handleChange = (field: keyof Deed) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (field === 'ownerNic') {
        const nic = e.target.value;
        setOwnerData(prev => ({ ...prev, nic }));
        
        // Auto-fill if owner exists
        const existingOwner = allOwners.find(o => o.nic === nic);
        if (existingOwner) {
            setOwnerData(existingOwner);
            setIsExistingOwner(true);
        } else {
            setIsExistingOwner(false);
            setOwnerData(prev => ({ ...prev, fullName: '', address: '', contactNumber: '' }));
        }
    }
  };

  const handleOwnerChange = (field: keyof Owner) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerData(prev => ({ ...prev, [field]: e.target.value }));
    if (field === 'nic') {
        const nic = e.target.value;
        setFormData(prev => ({ ...prev, ownerNic: nic }));

        // Filter owners for suggestions
        if (nic.trim()) {
            const matches = allOwners.filter(o => 
                o.nic.toLowerCase().includes(nic.toLowerCase()) || 
                o.fullName.toLowerCase().includes(nic.toLowerCase())
            );
            setFilteredOwners(matches);
            setShowSuggestions(true);
        } else {
            setFilteredOwners([]);
            setShowSuggestions(false);
        }

        // Auto-fill if owner exists (exact match)
        const existingOwner = allOwners.find(o => o.nic === nic);
        if (existingOwner) {
            setOwnerData(existingOwner);
            setIsExistingOwner(true);
            setShowSuggestions(false);
        } else {
            // Only clear if we were previously showing an existing owner
            if (isExistingOwner) {
                setOwnerData(prev => ({ ...prev, fullName: '', address: '', contactNumber: '' }));
            }
            setIsExistingOwner(false);
        }
    }
  };

  const selectOwner = (owner: Owner) => {
    setOwnerData(owner);
    setFormData(prev => ({ ...prev, ownerNic: owner.nic }));
    setIsExistingOwner(true);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, ownerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Deed Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deedNumber">Deed Number *</Label>
            <div className="flex gap-2">
              <Input
                id="deedNumber"
                value={formData.deedNumber}
                onChange={handleChange('deedNumber')}
                placeholder="Generate Deed ID or enter manually"
                required
              />
              <Button 
                type="button" 
                onClick={generateDeedId}
                variant="outline"
                size="icon"
                title="Generate Deed ID"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="landNumber">Land Number *</Label>
            <Input
              id="landNumber"
              value={formData.landNumber}
              onChange={handleChange('landNumber')}
              placeholder="e.g., L001"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="deedType">Deed Type *</Label>
            <Select 
              value={formData.deedType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, deedType: value }))}
            >
              <SelectTrigger id="deedType">
                <SelectValue placeholder="Select Deed Type" />
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
          
          <div>
            <Label htmlFor="registrationDate">Registration Date *</Label>
            <Input
              id="registrationDate"
              type="date"
              value={formData.registrationDate}
              onChange={handleChange('registrationDate')}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          New Owner Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Label htmlFor="ownerNic">Owner NIC *</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="ownerNic"
                value={ownerData.nic}
                onChange={handleOwnerChange('nic')}
                placeholder="Search by NIC or Name..."
                className="pl-8"
                required
                autoComplete="off"
                onFocus={() => {
                    if (ownerData.nic) {
                        const matches = allOwners.filter(o => 
                            o.nic.toLowerCase().includes(ownerData.nic.toLowerCase()) || 
                            o.fullName.toLowerCase().includes(ownerData.nic.toLowerCase())
                        );
                        setFilteredOwners(matches);
                        setShowSuggestions(true);
                    }
                }}
                onBlur={() => {
                    // Delay hiding to allow click event on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
            </div>
            {showSuggestions && filteredOwners.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                {filteredOwners.map((owner) => (
                  <div
                    key={owner.nic}
                    className="flex items-center justify-between p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        selectOwner(owner);
                    }}
                  >
                    <div>
                      <p className="font-medium">{owner.fullName}</p>
                      <p className="text-xs text-muted-foreground">{owner.nic}</p>
                    </div>
                    {owner.nic === ownerData.nic && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={ownerData.fullName}
              onChange={handleOwnerChange('fullName')}
              placeholder="e.g., John Doe"
              required
              disabled={isExistingOwner}
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={ownerData.address}
              onChange={handleOwnerChange('address')}
              placeholder="e.g., 123 Main St, Colombo"
              required
              disabled={isExistingOwner}
            />
          </div>

          <div>
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={ownerData.contactNumber}
              onChange={handleOwnerChange('contactNumber')}
              placeholder="e.g., 0771234567"
              required
              disabled={isExistingOwner}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Register Deed'}
        </Button>
      </div>
    </form>
  );
}

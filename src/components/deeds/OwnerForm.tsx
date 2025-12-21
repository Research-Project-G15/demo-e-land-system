import { useState } from 'react';
import { Owner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';

interface OwnerFormProps {
  onSubmit: (data: Owner) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function OwnerForm({ onSubmit, onCancel, isLoading = false }: OwnerFormProps) {
  const [formData, setFormData] = useState<Owner>({
    nic: '',
    fullName: '',
    address: '',
    contactNumber: '',
  });

  const handleChange = (field: keyof Owner) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Owner Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nic">NIC Number *</Label>
            <Input
              id="nic"
              value={formData.nic}
              onChange={handleChange('nic')}
              placeholder="e.g., 123456789V"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              placeholder="e.g., John Doe"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={handleChange('address')}
              placeholder="e.g., 123 Main St, Colombo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange('contactNumber')}
              placeholder="e.g., 0771234567"
              required
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
          {isLoading ? 'Saving...' : 'Register Owner'}
        </Button>
      </div>
    </form>
  );
}

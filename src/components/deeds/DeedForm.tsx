import { useState } from 'react';
import { Deed } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Save, RefreshCw } from 'lucide-react';

export interface DeedFormProps {
  onSubmit: (data: Deed) => Promise<void>;
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

  const generateDeedId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newId = `DEED-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, deedNumber: newId }));
  };

  const handleChange = (field: keyof Deed) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <Label htmlFor="ownerNic">Owner NIC *</Label>
            <Input
              id="ownerNic"
              value={formData.ownerNic}
              onChange={handleChange('ownerNic')}
              placeholder="e.g., 123456789V"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="deedType">Deed Type *</Label>
            <Input
              id="deedType"
              value={formData.deedType}
              onChange={handleChange('deedType')}
              placeholder="e.g., Gift, Sale"
              required
            />
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

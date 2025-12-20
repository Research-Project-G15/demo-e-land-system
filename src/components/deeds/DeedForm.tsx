import { useState } from 'react';
import { DeedData } from '@/lib/hashUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Save, X } from 'lucide-react';

interface DeedFormProps {
  initialData?: Partial<DeedData>;
  onSubmit: (data: DeedData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function DeedForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'create' 
}: DeedFormProps) {
  const [formData, setFormData] = useState<DeedData>({
    deedNumber: initialData?.deedNumber || '',
    ownerName: initialData?.ownerName || '',
    ownerNIC: initialData?.ownerNIC || '',
    landExtent: initialData?.landExtent || '',
    landLocation: initialData?.landLocation || '',
    district: initialData?.district || '',
    divisionalSecretariat: initialData?.divisionalSecretariat || '',
    gramaNiladhariDivision: initialData?.gramaNiladhariDivision || '',
    surveyPlanNumber: initialData?.surveyPlanNumber || '',
    notaryName: initialData?.notaryName || '',
    registrationDate: initialData?.registrationDate || '',
    previousOwner: initialData?.previousOwner || '',
  });

  const handleChange = (field: keyof DeedData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deed Information */}
        <div className="space-y-4">
          <h4 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Deed Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="deedNumber">Deed Number *</Label>
              <Input
                id="deedNumber"
                value={formData.deedNumber}
                onChange={handleChange('deedNumber')}
                placeholder="e.g., D/2024/COL/00145"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="surveyPlanNumber">Survey Plan Number *</Label>
              <Input
                id="surveyPlanNumber"
                value={formData.surveyPlanNumber}
                onChange={handleChange('surveyPlanNumber')}
                placeholder="e.g., SP/2024/COL/0892"
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
            
            <div>
              <Label htmlFor="notaryName">Notary Name *</Label>
              <Input
                id="notaryName"
                value={formData.notaryName}
                onChange={handleChange('notaryName')}
                placeholder="Enter notary name"
                required
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="space-y-4">
          <h4 className="font-display text-lg font-semibold text-foreground">
            Owner Information
          </h4>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="ownerName">Owner Full Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={handleChange('ownerName')}
                placeholder="Enter owner's full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="ownerNIC">Owner NIC *</Label>
              <Input
                id="ownerNIC"
                value={formData.ownerNIC}
                onChange={handleChange('ownerNIC')}
                placeholder="e.g., 198523456789"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="previousOwner">Previous Owner</Label>
              <Input
                id="previousOwner"
                value={formData.previousOwner}
                onChange={handleChange('previousOwner')}
                placeholder="Enter previous owner's name"
              />
            </div>
          </div>
        </div>

        {/* Land Details */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="font-display text-lg font-semibold text-foreground">
            Land Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="landExtent">Land Extent *</Label>
              <Input
                id="landExtent"
                value={formData.landExtent}
                onChange={handleChange('landExtent')}
                placeholder="e.g., 40 perches"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="landLocation">Land Location *</Label>
              <Input
                id="landLocation"
                value={formData.landLocation}
                onChange={handleChange('landLocation')}
                placeholder="Enter full address"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={handleChange('district')}
                placeholder="e.g., Colombo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="divisionalSecretariat">Divisional Secretariat *</Label>
              <Input
                id="divisionalSecretariat"
                value={formData.divisionalSecretariat}
                onChange={handleChange('divisionalSecretariat')}
                placeholder="e.g., Sri Jayawardenepura Kotte"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="gramaNiladhariDivision">Grama Niladhari Division *</Label>
              <Input
                id="gramaNiladhariDivision"
                value={formData.gramaNiladhariDivision}
                onChange={handleChange('gramaNiladhariDivision')}
                placeholder="e.g., Nawala North"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button type="submit" variant="hero" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Processing...' : mode === 'create' ? 'Register Deed' : 'Update Deed'}
        </Button>
      </div>
    </form>
  );
}

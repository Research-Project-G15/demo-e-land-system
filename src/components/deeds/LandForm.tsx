import { useState } from 'react';
import { Land } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Save } from 'lucide-react';

interface LandFormProps {
  onSubmit: (data: Land) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function LandForm({ onSubmit, onCancel, isLoading = false }: LandFormProps) {
  const [formData, setFormData] = useState<Land>({
    landNumber: '',
    district: '',
    division: '',
    area: '',
    areaUnit: 'Perches',
    mapReference: '',
  });

  const handleChange = (field: keyof Land) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <MapPin className="h-5 w-5 text-primary" />
          Land Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="division">Division *</Label>
            <Input
              id="division"
              value={formData.division}
              onChange={handleChange('division')}
              placeholder="e.g., Colombo 1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="area">Area *</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={handleChange('area')}
              placeholder="e.g., 10"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="areaUnit">Area Unit *</Label>
            <Input
              id="areaUnit"
              value={formData.areaUnit}
              onChange={handleChange('areaUnit')}
              placeholder="e.g., Perches, Acres"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="mapReference">Map Reference *</Label>
            <Input
              id="mapReference"
              value={formData.mapReference}
              onChange={handleChange('mapReference')}
              placeholder="e.g., M-101"
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
          {isLoading ? 'Saving...' : 'Register Land'}
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { Land, Owner, Deed } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { getAllOwners, registerLand, registerDeed } from '@/lib/deedStorage';
import { MapPin, User, FileText, Search, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

interface DeedRegistrationWizardProps {
  onSuccess: () => void;
}

export function DeedRegistrationWizard({ onSuccess }: DeedRegistrationWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Data States
  const [landData, setLandData] = useState<Land>({
    landNumber: '',
    district: '',
    division: '',
    area: '',
    areaUnit: 'Perches',
    mapReference: '',
  });

  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);

  const [deedData, setDeedData] = useState<Deed>({
    deedNumber: '',
    landNumber: '',
    ownerNic: '',
    registrationDate: new Date().toISOString().split('T')[0],
    deedType: 'Sale',
    status: 'ACTIVE',
  });

  useEffect(() => {
    setOwners(getAllOwners());
  }, []);

  useEffect(() => {
    if (ownerSearchQuery) {
      setFilteredOwners(owners.filter(o => o.nic.toLowerCase().includes(ownerSearchQuery.toLowerCase())));
    } else {
      setFilteredOwners([]);
    }
  }, [ownerSearchQuery, owners]);

  // Generate Deed ID when entering step 3
  useEffect(() => {
    if (step === 3 && !deedData.deedNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      setDeedData(prev => ({ ...prev, deedNumber: `DEED-${timestamp}-${random}` }));
    }
  }, [step]);

  const handleLandChange = (field: keyof Land) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLandData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDeedChange = (field: keyof Deed) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeedData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const validateStep1 = () => {
    if (!landData.landNumber || !landData.district || !landData.division || !landData.area || !landData.mapReference) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required land details.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!selectedOwner) {
      toast({
        title: "Owner Required",
        description: "Please select an owner.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRegisterClick = () => {
    if (!deedData.deedType) {
      toast({
        title: "Missing Information",
        description: "Please enter deed type.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      // Register Land
      // Note: In a real app, we might check if land exists first, but here we assume new land for new deed or update
      // For simplicity, we'll try to register land. If it exists, we might need to handle that (or assume this flow creates new land)
      // The requirement says "Land & Deed Registration", implying both.
      
      try {
        registerLand(landData);
      } catch (e) {
        // Ignore if land already exists? Or fail? 
        // If land exists, we probably just want to link the deed to it.
        // But the form asks for land details, so let's assume we are creating/updating.
        console.log("Land might already exist", e);
      }

      const finalDeedData = {
        ...deedData,
        landNumber: landData.landNumber,
        ownerNic: selectedOwner!.nic
      };

      registerDeed(finalDeedData);
      
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleFinalSuccess = () => {
    setShowSuccessDialog(false);
    onSuccess();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted -z-10" />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex flex-col items-center bg-background px-4 ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${step >= s ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-background'}`}>
                {s === 1 && <MapPin className="w-5 h-5" />}
                {s === 2 && <User className="w-5 h-5" />}
                {s === 3 && <FileText className="w-5 h-5" />}
              </div>
              <span className="text-sm font-medium">
                {s === 1 && "Land Info"}
                {s === 2 && "Ownership"}
                {s === 3 && "Deed Info"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={step === 1 ? "flex justify-center" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        {/* Main Form Area */}
        <div className={step === 1 ? "w-full max-w-3xl" : "lg:col-span-2"}>
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Land Information"}
                {step === 2 && "Ownership Information"}
                {step === 3 && "Deed Information"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Enter the details of the land to be registered."}
                {step === 2 && "Select the owner for this land."}
                {step === 3 && "Review and register the deed."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landNumber">Land Number *</Label>
                      <Input id="landNumber" value={landData.landNumber} onChange={handleLandChange('landNumber')} placeholder="L001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mapReference">Map Reference *</Label>
                      <Input id="mapReference" value={landData.mapReference} onChange={handleLandChange('mapReference')} placeholder="Map Ref #123" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input id="district" value={landData.district} onChange={handleLandChange('district')} placeholder="Colombo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="division">Division *</Label>
                      <Input id="division" value={landData.division} onChange={handleLandChange('division')} placeholder="Colombo 01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area *</Label>
                      <Input id="area" value={landData.area} onChange={handleLandChange('area')} placeholder="10.5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaUnit">Unit</Label>
                      <Input id="areaUnit" value={landData.areaUnit} onChange={handleLandChange('areaUnit')} placeholder="Perches" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Search Owner by NIC</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter NIC number..."
                        className="pl-8"
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                      />
                    </div>
                    {filteredOwners.length > 0 && (
                      <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                        {filteredOwners.map(owner => (
                          <div 
                            key={owner.nic} 
                            className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
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
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 border">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" /> Selected Owner
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Full Name:</span>
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
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deedNumber">Deed Number (Auto-generated)</Label>
                    <Input id="deedNumber" value={deedData.deedNumber} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deedType">Deed Type *</Label>
                    <Select 
                      value={deedData.deedType} 
                      onValueChange={(value) => setDeedData(prev => ({ ...prev, deedType: value }))}
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
                  <div className="space-y-2">
                    <Label htmlFor="registrationDate">Registration Date</Label>
                    <Input id="registrationDate" type="date" value={deedData.registrationDate} onChange={handleDeedChange('registrationDate')} />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                
                {step < 3 ? (
                  <Button onClick={handleNext}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleRegisterClick}>
                    Register Details <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Summary */}
        {step >= 2 && (
          <div className="lg:col-span-1">
            <Card className="h-full border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg">Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Land Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Number:</span> {landData.landNumber}</p>
                    <p><span className="font-medium">District:</span> {landData.district}</p>
                    <p><span className="font-medium">Division:</span> {landData.division}</p>
                    <p><span className="font-medium">Area:</span> {landData.area} {landData.areaUnit}</p>
                  </div>
                </div>

                {selectedOwner && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> Owner Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {selectedOwner.fullName}</p>
                        <p><span className="font-medium">NIC:</span> {selectedOwner.nic}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Please review the details before finalizing the registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Deed Information</h4>
              <div className="text-sm grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Deed No:</span> <span>{deedData.deedNumber}</span>
                <span className="text-muted-foreground">Type:</span> <span>{deedData.deedType}</span>
                <span className="text-muted-foreground">Date:</span> <span>{deedData.registrationDate}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Land Information</h4>
              <div className="text-sm grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Land No:</span> <span>{landData.landNumber}</span>
                <span className="text-muted-foreground">Location:</span> <span>{landData.division}, {landData.district}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Owner Information</h4>
              <div className="text-sm grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Name:</span> <span>{selectedOwner?.fullName}</span>
                <span className="text-muted-foreground">NIC:</span> <span>{selectedOwner?.nic}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmRegistration}>Confirmation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Registration Successful!</DialogTitle>
            <DialogDescription className="text-center">
              The deed has been successfully registered in the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleFinalSuccess} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

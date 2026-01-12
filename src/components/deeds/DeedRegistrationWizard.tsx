import { useState, useEffect } from 'react';
import { Land, Owner, Deed } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { getAllOwners, registerLand, registerDeed, searchOwners, getNextDeedId, getOwner, registerOwner } from '@/lib/deedStorage';
import { MapPin, User, FileText, Search, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

interface DeedRegistrationWizardProps {
  onSuccess: () => void;
}

import { useAuth } from '@/hooks/useAuth';

export function DeedRegistrationWizard({ onSuccess }: DeedRegistrationWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
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

  const [ownerFormData, setOwnerFormData] = useState<Owner>({
    nic: '',
    fullName: '',
    address: '',
    contactNumber: ''
  });

  const [deedData, setDeedData] = useState<Deed>({
    deedNumber: '',
    landNumber: '',
    ownerNic: '',
    registrationDate: new Date().toISOString().split('T')[0],
    deedType: 'Sale',
    status: 'ACTIVE',
  });

  const handleOwnerChange = (field: keyof Owner) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNicBlur = async () => {
    if (ownerFormData.nic) {
      try {
        const existing = await getOwner(ownerFormData.nic);
        if (existing) {
          setOwnerFormData(existing);
          toast({ 
            title: "Existing Owner Found", 
            description: "Loaded details for this NIC." 
          });
        }
      } catch (error) {
        console.error("Error checking owner:", error);
      }
    }
  };

  // Generate Deed ID when entering step 3
  useEffect(() => {
    const fetchNextId = async () => {
      if (step === 3 && !deedData.deedNumber) {
        const nextId = await getNextDeedId();
        setDeedData(prev => ({ ...prev, deedNumber: nextId }));
      }
    };
    fetchNextId();
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
    if (!ownerFormData.nic || !ownerFormData.fullName || !ownerFormData.address || !ownerFormData.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all owner details.",
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
        await registerLand(landData, user?.username);
      } catch (e) {
        // Ignore if land already exists? Or fail? 
        // If land exists, we probably just want to link the deed to it.
        // But the form asks for land details, so let's assume we are creating/updating.
        console.log("Land might already exist", e);
      }

      // Register Owner if not exists
      try {
        const existing = await getOwner(ownerFormData.nic);
        if (!existing) {
          await registerOwner(ownerFormData, user?.username);
        } else {
          // If expecting an update, we would do it here.  
          // Currently we just use the existing owner linkage.
          // Ideally we warn if details mismatch, but for now we assume linkage by NIC is primary.
        }
      } catch (e) {
        console.error("Error handling owner:", e);
        // Fallthrough, might fail at deed registration if owner doesn't exist
      }

      const finalDeedData = {
        ...deedData,
        landNumber: landData.landNumber,
        ownerNic: ownerFormData.nic
      };

      await registerDeed(finalDeedData, user?.username);

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
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Owner Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerNic">NIC (National ID) *</Label>
                      <Input 
                        id="ownerNic" 
                        value={ownerFormData.nic} 
                        onChange={handleOwnerChange('nic')} 
                        onBlur={handleNicBlur}
                        placeholder="123456789V" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input 
                        id="fullName" 
                        value={ownerFormData.fullName} 
                        onChange={handleOwnerChange('fullName')} 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input 
                        id="contactNumber" 
                        value={ownerFormData.contactNumber} 
                        onChange={handleOwnerChange('contactNumber')} 
                        placeholder="0711234567" 
                      />
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input 
                        id="address" 
                        value={ownerFormData.address} 
                        onChange={handleOwnerChange('address')} 
                        placeholder="123 Main St, Colombo" 
                      />
                    </div>
                  </div>
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

                {ownerFormData.nic && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> Owner Details
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {ownerFormData.fullName}</p>
                        <p><span className="font-medium">NIC:</span> {ownerFormData.nic}</p>
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
                <span className="text-muted-foreground">Name:</span> <span>{ownerFormData.fullName}</span>
                <span className="text-muted-foreground">NIC:</span> <span>{ownerFormData.nic}</span>
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

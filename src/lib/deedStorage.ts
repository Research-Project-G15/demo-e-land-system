import { Land, Owner, Deed, AuditLog } from './types';

const LAND_KEY = 'land_registry_lands';
const OWNER_KEY = 'land_registry_owners';
const DEED_KEY = 'land_registry_deeds';
const LOG_KEY = 'land_registry_logs';

// Helper to get data from storage
function getStored<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

// Helper to set data to storage
function setStored<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Audit Logging ---

function logAction(action: 'CREATE' | 'UPDATE' | 'TRANSFER', details: string) {
  const logs = getStored<AuditLog>(LOG_KEY);
  const newLog: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user: 'Admin', // Hardcoded for now
    action,
    details,
  };
  logs.push(newLog);
  setStored(LOG_KEY, logs);
}

export function getAuditLogs(): AuditLog[] {
  return getStored<AuditLog>(LOG_KEY).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Land Management ---

export function registerLand(land: Land): void {
  const lands = getStored<Land>(LAND_KEY);
  if (lands.some(l => l.landNumber === land.landNumber)) {
    throw new Error(`Land with number ${land.landNumber} already exists.`);
  }
  lands.push(land);
  setStored(LAND_KEY, lands);
  logAction('CREATE', `Registered land: ${land.landNumber}`);
}

export function getLand(landNumber: string): Land | undefined {
  const lands = getStored<Land>(LAND_KEY);
  return lands.find(l => l.landNumber === landNumber);
}

export function getAllLands(): Land[] {
  return getStored<Land>(LAND_KEY);
}

// --- Owner Management ---

export function registerOwner(owner: Owner): void {
  const owners = getStored<Owner>(OWNER_KEY);
  if (owners.some(o => o.nic === owner.nic)) {
    throw new Error(`Owner with NIC ${owner.nic} already exists.`);
  }
  owners.push(owner);
  setStored(OWNER_KEY, owners);
  logAction('CREATE', `Registered owner: ${owner.fullName} (${owner.nic})`);
}

export function getOwner(nic: string): Owner | undefined {
  const owners = getStored<Owner>(OWNER_KEY);
  return owners.find(o => o.nic === nic);
}

export function getAllOwners(): Owner[] {
  return getStored<Owner>(OWNER_KEY);
}

// --- Deed Management ---

export function registerDeed(deed: Deed): void {
  const deeds = getStored<Deed>(DEED_KEY);
  if (deeds.some(d => d.deedNumber === deed.deedNumber)) {
    throw new Error(`Deed with number ${deed.deedNumber} already exists.`);
  }
  
  // Validate Land and Owner exist
  if (!getLand(deed.landNumber)) {
    throw new Error(`Land ${deed.landNumber} does not exist.`);
  }
  if (!getOwner(deed.ownerNic)) {
    throw new Error(`Owner ${deed.ownerNic} does not exist.`);
  }

  deeds.push(deed);
  setStored(DEED_KEY, deeds);
  logAction('CREATE', `Registered deed: ${deed.deedNumber} for land ${deed.landNumber}`);
}

export function transferOwnership(oldDeedNumber: string, newDeedDetails: Omit<Deed, 'status' | 'previousDeedNumber'>): void {
  const deeds = getStored<Deed>(DEED_KEY);
  const oldDeedIndex = deeds.findIndex(d => d.deedNumber === oldDeedNumber);
  
  if (oldDeedIndex === -1) {
    throw new Error(`Deed ${oldDeedNumber} not found.`);
  }
  
  if (deeds[oldDeedIndex].status !== 'ACTIVE') {
    throw new Error(`Deed ${oldDeedNumber} is not active.`);
  }

  // Update old deed status
  deeds[oldDeedIndex].status = 'TRANSFERRED';
  
  // Create new deed
  const newDeed: Deed = {
    ...newDeedDetails,
    status: 'ACTIVE',
    previousDeedNumber: oldDeedNumber,
  };

  if (deeds.some(d => d.deedNumber === newDeed.deedNumber)) {
     throw new Error(`Deed with number ${newDeed.deedNumber} already exists.`);
  }

   // Validate Land and Owner exist
  if (!getLand(newDeed.landNumber)) {
    throw new Error(`Land ${newDeed.landNumber} does not exist.`);
  }
  if (!getOwner(newDeed.ownerNic)) {
    throw new Error(`Owner ${newDeed.ownerNic} does not exist.`);
  }

  deeds.push(newDeed);
  setStored(DEED_KEY, deeds);
  logAction('TRANSFER', `Transferred ownership from deed ${oldDeedNumber} to ${newDeed.deedNumber}`);
}

export function getDeed(deedNumber: string): Deed | undefined {
  const deeds = getStored<Deed>(DEED_KEY);
  return deeds.find(d => d.deedNumber === deedNumber);
}

export function getAllDeeds(): Deed[] {
  return getStored<Deed>(DEED_KEY);
}

export function getOwnershipHistory(landNumber: string): Deed[] {
  const deeds = getStored<Deed>(DEED_KEY);
  return deeds
    .filter(d => d.landNumber === landNumber)
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
}

// Initialize sample data if empty
export function initializeSampleData() {
  if (getAllLands().length === 0) {
    registerLand({
      landNumber: 'L001',
      district: 'Colombo',
      division: 'Colombo 1',
      area: '10',
      areaUnit: 'Perches',
      mapReference: 'M-101'
    });
    registerOwner({
      nic: '123456789V',
      fullName: 'John Doe',
      address: '123 Main St, Colombo',
      contactNumber: '0771234567'
    });
    registerDeed({
      deedNumber: 'D001',
      landNumber: 'L001',
      ownerNic: '123456789V',
      registrationDate: new Date().toISOString(),
      deedType: 'Gift',
      status: 'ACTIVE'
    });
  }
}

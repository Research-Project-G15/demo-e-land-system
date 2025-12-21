import { Deed, AuditLog } from './types';

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
    user: 'Admin',
    action,
    details,
  };
  logs.push(newLog);
  setStored(LOG_KEY, logs);
}

export function getAuditLogs(): AuditLog[] {
  return getStored<AuditLog>(LOG_KEY).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Deed Management ---

export function registerDeed(deed: Deed): void {
  const deeds = getStored<Deed>(DEED_KEY);
  if (deeds.some(d => d.deedNumber === deed.deedNumber)) {
    throw new Error(`Deed with number ${deed.deedNumber} already exists.`);
  }
  deeds.push(deed);
  setStored(DEED_KEY, deeds);
  logAction('CREATE', `Registered deed: ${deed.deedNumber} for owner ${deed.owner.fullName}`);
}

export function getDeed(deedNumber: string): Deed | undefined {
  const deeds = getStored<Deed>(DEED_KEY);
  return deeds.find(d => d.deedNumber === deedNumber);
}

export function getAllDeeds(): Deed[] {
  return getStored<Deed>(DEED_KEY);
}

export function searchDeeds(query: string): Deed[] {
  const deeds = getStored<Deed>(DEED_KEY);
  const lowerQuery = query.toLowerCase();
  return deeds.filter(d => 
    d.deedNumber.toLowerCase().includes(lowerQuery) ||
    d.owner.nic.toLowerCase().includes(lowerQuery) ||
    d.owner.fullName.toLowerCase().includes(lowerQuery)
  );
}

export function updateDeed(deedNumber: string, updatedDeed: Deed): void {
  const deeds = getStored<Deed>(DEED_KEY);
  const index = deeds.findIndex(d => d.deedNumber === deedNumber);
  if (index === -1) {
    throw new Error(`Deed ${deedNumber} not found.`);
  }
  deeds[index] = updatedDeed;
  setStored(DEED_KEY, deeds);
  logAction('UPDATE', `Updated deed: ${deedNumber}`);
}

export function transferOwnership(oldDeedNumber: string, newDeed: Deed): void {
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
  
  // Add new deed with reference to old one
  const finalNewDeed: Deed = {
    ...newDeed,
    status: 'ACTIVE',
    previousDeedNumber: oldDeedNumber,
  };

  if (deeds.some(d => d.deedNumber === finalNewDeed.deedNumber)) {
    throw new Error(`Deed with number ${finalNewDeed.deedNumber} already exists.`);
  }

  deeds.push(finalNewDeed);
  setStored(DEED_KEY, deeds);
  logAction('TRANSFER', `Transferred ownership from deed ${oldDeedNumber} to ${finalNewDeed.deedNumber}`);
}

// Initialize sample data if empty
export function initializeSampleData() {
  if (getAllDeeds().length === 0) {
    registerDeed({
      deedNumber: 'D-2024-001',
      surveyPlanNumber: 'SP-1234',
      registrationDate: new Date().toISOString().split('T')[0],
      notaryName: 'Mr. K. Silva',
      owner: {
        fullName: 'John Perera',
        nic: '123456789V',
        previousOwner: 'James Fernando',
      },
      land: {
        landExtent: '10 Perches',
        landLocation: 'Kollupitiya',
        district: 'Colombo',
        divisionalSecretariat: 'Colombo',
        gramaNiladhariDivision: 'Kollupitiya West',
      },
      status: 'ACTIVE',
    });
  }
}
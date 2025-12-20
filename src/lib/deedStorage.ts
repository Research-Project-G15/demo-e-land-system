import { StoredDeed, DeedData, generateDeedHash, generateDeedId, storeOnChain } from './hashUtils';

// Simulated off-chain database storage (localStorage for demo)
const STORAGE_KEY = 'land_deed_database';

export function getAllDeeds(): StoredDeed[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getDeedById(id: string): StoredDeed | null {
  const deeds = getAllDeeds();
  return deeds.find(d => d.id === id) || null;
}

export async function createDeed(deedData: DeedData): Promise<StoredDeed> {
  const deeds = getAllDeeds();
  
  // Generate hash from the deed data
  const generatedHash = await generateDeedHash(deedData);
  const id = generateDeedId();
  
  const newDeed: StoredDeed = {
    ...deedData,
    id,
    generatedHash,
    createdAt: new Date().toISOString(),
    isVerified: true,
  };

  // Store hash on-chain (simulated)
  storeOnChain(id, generatedHash);

  // Store deed in off-chain database
  deeds.push(newDeed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deeds));

  return newDeed;
}

export async function updateDeed(id: string, deedData: Partial<DeedData>): Promise<StoredDeed | null> {
  const deeds = getAllDeeds();
  const index = deeds.findIndex(d => d.id === id);
  
  if (index === -1) return null;

  // Update the deed data (this simulates tampering or legitimate update)
  const updatedDeed = {
    ...deeds[index],
    ...deedData,
  };

  // Recalculate hash based on new data
  const newHash = await generateDeedHash(updatedDeed);
  
  // The stored hash remains the ORIGINAL hash (on-chain)
  // So if data changed, verification will fail
  updatedDeed.isVerified = newHash === deeds[index].generatedHash;

  deeds[index] = updatedDeed;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deeds));

  return updatedDeed;
}

export function deleteDeed(id: string): boolean {
  const deeds = getAllDeeds();
  const filtered = deeds.filter(d => d.id !== id);
  
  if (filtered.length === deeds.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export async function verifyDeed(id: string): Promise<{ isValid: boolean; currentHash: string; storedHash: string }> {
  const deed = getDeedById(id);
  if (!deed) {
    throw new Error('Deed not found');
  }

  const currentHash = await generateDeedHash(deed);
  const isValid = currentHash === deed.generatedHash;

  // Update verification status
  const deeds = getAllDeeds();
  const index = deeds.findIndex(d => d.id === id);
  if (index !== -1) {
    deeds[index].isVerified = isValid;
    deeds[index].lastVerified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deeds));
  }

  return {
    isValid,
    currentHash,
    storedHash: deed.generatedHash,
  };
}

// Initialize with sample data if empty
export async function initializeSampleData(): Promise<void> {
  const existing = getAllDeeds();
  if (existing.length > 0) return;

  const sampleDeeds: DeedData[] = [
    {
      deedNumber: 'D/2024/COL/00145',
      ownerName: 'Perera Arachchige Don Kamal',
      ownerNIC: '198523456789',
      landExtent: '40 perches',
      landLocation: 'No. 45, Temple Road, Kotte',
      district: 'Colombo',
      divisionalSecretariat: 'Sri Jayawardenepura Kotte',
      gramaNiladhariDivision: 'Nawala North',
      surveyPlanNumber: 'SP/2024/COL/0892',
      notaryName: 'H.M. Jayasinghe',
      registrationDate: '2024-03-15',
      previousOwner: 'Wickramasinghe Mudiyanselage Saman',
    },
    {
      deedNumber: 'D/2024/GAM/00089',
      ownerName: 'Fernando Gamage Nimal',
      ownerNIC: '197812345678',
      landExtent: '2 acres 15 perches',
      landLocation: 'Lot 12, Habarana Road, Sigiriya',
      district: 'Matale',
      divisionalSecretariat: 'Dambulla',
      gramaNiladhariDivision: 'Sigiriya West',
      surveyPlanNumber: 'SP/2024/MAT/0234',
      notaryName: 'K.P. Bandara',
      registrationDate: '2024-06-22',
      previousOwner: 'State Land Grant - Presidential',
    },
    {
      deedNumber: 'D/2023/KAN/00567',
      ownerName: 'Rathnayake Mudiyanselage Kumari',
      ownerNIC: '199034567890',
      landExtent: '25 perches',
      landLocation: 'No. 78, Dalada Veediya, Kandy',
      district: 'Kandy',
      divisionalSecretariat: 'Kandy Four Gravets',
      gramaNiladhariDivision: 'Katukele',
      surveyPlanNumber: 'SP/2023/KAN/1456',
      notaryName: 'S. Dissanayake',
      registrationDate: '2023-11-08',
      previousOwner: 'Rathnayake Mudiyanselage Bandula',
    },
  ];

  for (const deed of sampleDeeds) {
    await createDeed(deed);
  }
}

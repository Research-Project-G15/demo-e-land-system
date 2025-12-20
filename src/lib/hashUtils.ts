// SHA-256 hash generation for deed data integrity verification
export interface DeedData {
  deedNumber: string;
  ownerName: string;
  ownerNIC: string;
  landExtent: string;
  landLocation: string;
  district: string;
  divisionalSecretariat: string;
  gramaNiladhariDivision: string;
  surveyPlanNumber: string;
  notaryName: string;
  registrationDate: string;
  previousOwner: string;
}

export interface StoredDeed extends DeedData {
  id: string;
  generatedHash: string;
  createdAt: string;
  lastVerified?: string;
  isVerified?: boolean;
}

// Generate SHA-256 hash from deed data
export async function generateDeedHash(deed: DeedData): Promise<string> {
  // Concatenate all deed fields in a consistent order
  const dataString = [
    deed.deedNumber,
    deed.ownerName,
    deed.ownerNIC,
    deed.landExtent,
    deed.landLocation,
    deed.district,
    deed.divisionalSecretariat,
    deed.gramaNiladhariDivision,
    deed.surveyPlanNumber,
    deed.notaryName,
    deed.registrationDate,
    deed.previousOwner,
  ].join('|');

  // Convert to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);

  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

// Verify if current data matches stored hash
export async function verifyDeedIntegrity(deed: DeedData, storedHash: string): Promise<boolean> {
  const currentHash = await generateDeedHash(deed);
  return currentHash === storedHash;
}

// Generate a unique deed ID (simulated blockchain transaction ID)
export function generateDeedId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `DEED-${timestamp}-${random}`.toUpperCase();
}

// Format hash for display (shortened with ellipsis)
export function formatHashShort(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

// Simulate on-chain storage (in real system, this would be blockchain)
const ON_CHAIN_REGISTRY: Map<string, { hash: string; timestamp: string; blockNumber: number }> = new Map();

let currentBlock = 1000;

export function storeOnChain(deedId: string, hash: string): { blockNumber: number; timestamp: string } {
  currentBlock++;
  const entry = {
    hash,
    timestamp: new Date().toISOString(),
    blockNumber: currentBlock,
  };
  ON_CHAIN_REGISTRY.set(deedId, entry);
  return { blockNumber: entry.blockNumber, timestamp: entry.timestamp };
}

export function getOnChainRecord(deedId: string): { hash: string; timestamp: string; blockNumber: number } | null {
  return ON_CHAIN_REGISTRY.get(deedId) || null;
}

export function getAllOnChainRecords(): Array<{ deedId: string; hash: string; timestamp: string; blockNumber: number }> {
  return Array.from(ON_CHAIN_REGISTRY.entries()).map(([deedId, data]) => ({
    deedId,
    ...data,
  }));
}

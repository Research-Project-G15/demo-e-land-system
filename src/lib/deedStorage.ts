import { Land, Owner, Deed, AuditLog } from './types';

const API_URL = 'http://localhost:5000/api';

// --- Audit Logging ---

export async function getAuditLogs(): Promise<AuditLog[]> {
  // TODO: Implement backend endpoint if needed
  return [];
}

// --- Land Management ---

export async function registerLand(land: Land): Promise<Land> {
  const response = await fetch(`${API_URL}/lands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(land),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to register land');
  }
  return response.json();
}

export async function getLand(landNumber: string): Promise<Land | undefined> {
  try {
    const response = await fetch(`${API_URL}/lands/${landNumber}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Failed to fetch land');
    return response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getAllLands(): Promise<Land[]> {
  try {
    const response = await fetch(`${API_URL}/lands`);
    if (!response.ok) throw new Error('Failed to fetch lands');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// --- Owner Management ---

export async function registerOwner(owner: Owner): Promise<Owner> {
  const response = await fetch(`${API_URL}/owners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(owner),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to register owner');
  }
  return response.json();
}

export async function getOwner(nic: string): Promise<Owner | undefined> {
  try {
    const response = await fetch(`${API_URL}/owners/${nic}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Failed to fetch owner');
    return response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getAllOwners(): Promise<Owner[]> {
  try {
    const response = await fetch(`${API_URL}/owners`);
    if (!response.ok) throw new Error('Failed to fetch owners');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function searchOwners(query: string): Promise<Owner[]> {
  try {
    const response = await fetch(`${API_URL}/owners/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search owners');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// --- Deed Management ---

export async function getNextDeedId(previousDeedId?: string): Promise<string> {
  try {
    const url = previousDeedId 
      ? `${API_URL}/deeds/next-id?previousDeedId=${previousDeedId}`
      : `${API_URL}/deeds/next-id`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch next deed ID');
    const data = await response.json();
    return data.nextId;
  } catch (error) {
    console.error(error);
    // Fallback
    if (previousDeedId) return `${previousDeedId}-01`;
    return `D${Date.now().toString().slice(-3)}`;
  }
}

export async function registerDeed(deed: Deed): Promise<Deed> {
  const response = await fetch(`${API_URL}/deeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deed),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to register deed');
  }
  return response.json();
}

export async function transferOwnership(oldDeedNumber: string, newDeedDetails: Omit<Deed, 'status' | 'previousDeedNumber'>): Promise<Deed> {
  const response = await fetch(`${API_URL}/deeds/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldDeedNumber, newDeedDetails }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to transfer ownership');
  }
  return response.json();
}

export async function getDeed(deedNumber: string): Promise<Deed | undefined> {
  try {
    const response = await fetch(`${API_URL}/deeds/${deedNumber}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Failed to fetch deed');
    return response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getAllDeeds(): Promise<Deed[]> {
  try {
    const response = await fetch(`${API_URL}/deeds`);
    if (!response.ok) throw new Error('Failed to fetch deeds');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getOwnershipHistory(landNumber: string): Promise<Deed[]> {
  try {
    const response = await fetch(`${API_URL}/deeds/history/${landNumber}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Initialize sample data if empty
export async function initializeSampleData() {
  // No-op
}

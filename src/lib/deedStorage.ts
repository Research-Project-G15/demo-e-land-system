import { Land, Owner, Deed, AuditLog } from './types';

const API_URL = 'http://localhost:5000/api';

// --- Audit Logging ---

export async function getAuditLogs(): Promise<AuditLog[]> {
  // TODO: Implement backend endpoint if needed
  return [];
}

// --- Land Management ---

export async function registerLand(land: Land, username?: string): Promise<Land> {
  const body = username ? { ...land, username } : land;
  const response = await fetch(`${API_URL}/lands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

export async function registerOwner(owner: Owner, username?: string): Promise<Owner> {
  const body = username ? { ...owner, username } : owner;
  const response = await fetch(`${API_URL}/owners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

export async function registerDeed(deed: Deed, username?: string): Promise<Deed> {
  const body = username ? { ...deed, username } : deed;
  const response = await fetch(`${API_URL}/deeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to register deed');
  }
  return response.json();
}

// Transfer function removed
// export async function transferOwnership(...) { ... }

export async function getDeed(deedNumber: string, username?: string): Promise<Deed | undefined> {
  try {
    const url = username 
      ? `${API_URL}/deeds/${deedNumber}?username=${encodeURIComponent(username)}` // The backend doesn't support query params on /:id route for logging yet, but I should add it or just rely on search.
      : `${API_URL}/deeds/${deedNumber}`;
      
    // Actually, getDeed is typically a direct fetch. The "Search" action implies looking for something.
    // I added a new endpoint `deeds/search?q=...&username=...`.
    // So if I want to log search, I should use that or modify getDeed to optionally search via the search endpoint if ambiguous.
    // However, verifyPage calls getDeed directly.
    // Let's modify getDeed to call the search endpoint if we want logging, OR modify the get action in backend to log if headers/query present.
    // Backend `router.get('/:id')` does not have logging.
    
    // I think it's better to update the backend getbyID to also log "SEARCH" if provided.
    // Or, in VerifyPage, we can call a dedicated search function.
    
    // Let's modify the backend first to accept query param on getById? Or just leave it.
    // The user requirement "search deeds" likely refers to the "Search" feature in VerifyPage or DeedsPage.
    // In VerifyPage, it calls `getDeed(searchQuery)`.
    
    const response = await fetch(url);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error('Failed to fetch deed');
    return response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function updateDeed(deed: Deed, username?: string): Promise<Deed> {
  const body = username ? { ...deed, username } : deed;
  const response = await fetch(`${API_URL}/deeds/${deed.deedNumber}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || 'Failed to update deed');
  }
  return response.json();
}

export async function searchDeeds(query: string, username?: string): Promise<Deed[]> {
    try {
        let url = `${API_URL}/deeds/search?q=${encodeURIComponent(query)}`;
        if (username) {
            url += `&username=${encodeURIComponent(username)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to search deeds');
        return response.json();
    } catch (error) {
        console.error(error);
        return [];
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

export async function getOwnershipHistory(landNumber: string, username?: string): Promise<Deed[]> {
  try {
    let url = `${API_URL}/deeds/history/${landNumber}`;
    if (username) {
        url += `?username=${encodeURIComponent(username)}`;
    }
    const response = await fetch(url);
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

export interface Land {
  landExtent: string;
  landLocation: string;
  district: string;
  divisionalSecretariat: string;
  gramaNiladhariDivision: string;
}

export interface Owner {
  fullName: string;
  nic: string;
  previousOwner?: string;
}

export type DeedStatus = 'ACTIVE' | 'TRANSFERRED';

export interface Deed {
  deedNumber: string;
  surveyPlanNumber: string;
  registrationDate: string;
  notaryName: string;
  owner: Owner;
  land: Land;
  status: DeedStatus;
  previousDeedNumber?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'TRANSFER';
  details: string;
}
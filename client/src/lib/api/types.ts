// src/lib/api/types.ts
export interface Lead {
  _id: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  notes: string[];
  manager: string | {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Manager {
  _id: string;
  name: string;
  email: string;
  role: 'manager';
  createdAt: string;
}
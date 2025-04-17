import api from './axios';

// Types for the API responses
export interface Manager {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  notes: string;
  manager: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  totalManagers: number;
  leadsByStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELED: number;
  };
  recentLeads: Lead[];
}

// Dashboard stats
export const getDashboardStats = async () => {
  const response = await api.get<DashboardStats>('/employer/dashboard-stats');
  return response.data;
};

// Managers endpoints
export const getManagers = async () => {
  const response = await api.get<Manager[]>('/employer/managers');
  return response.data;
};

export const createManager = async (data: { name: string; email: string; password: string }) => {
  const response = await api.post<Manager>('/employer/managers', data);
  return response.data;
};

export const updateManager = async (
  managerId: string,
  data: { name?: string; email?: string; password?: string }
) => {
  const response = await api.put<Manager>(`/employer/managers/${managerId}`, data);
  return response.data;
};

export const deleteManager = async (managerId: string) => {
  await api.delete(`/employer/managers/${managerId}`);
};

// Leads endpoints
export const getLeads = async (filters?: { managerId?: string; status?: string }) => {
  const response = await api.get<Lead[]>('/employer/leads', { params: filters });
  return response.data;
};

export const createLead = async (data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
  status: string;
  managerId: string;
}) => {
  const response = await api.post<Lead>('/employer/leads', data);
  return response.data;
};

export const updateLead = async (
  leadId: string,
  data: {
    contactName?: string;
    contactEmail?: string;
    companyName?: string;
    status?: string;
    managerId?: string;
    notes?: string;
  }
) => {
  const response = await api.put<Lead>(`/employer/leads/${leadId}`, data);
  return response.data;
};

export const deleteLead = async (leadId: string) => {
  await api.delete(`/employer/leads/${leadId}`);
};
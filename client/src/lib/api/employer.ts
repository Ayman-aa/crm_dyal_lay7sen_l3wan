import api from './axios';

export interface DashboardStats {
  inProgressCount: number;
  completedCount: number;
  canceledCount: number;
}

export interface Manager {
  _id: string;
  name: string;
  email: string;
  role: 'manager';
  createdAt: string;
}

export interface CreateManagerPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateManagerPayload {
  name?: string;
  email?: string;
  password?: string;
}

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

export interface LeadFilters {
  managerId?: string;
  status?: string;
}

export interface CreateLeadPayload {
  contactName: string;
  contactEmail: string;
  companyName: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  managerId: string;
  notes?: string[];
}

export interface UpdateLeadPayload {
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  managerId?: string;
  notes?: string[];
}

// Dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/employer/dashboard-stats');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to fetch dashboard stats';
    throw new Error(errorMessage);
  }
};

// Get all managers
export const getManagers = async (): Promise<Manager[]> => {
  try {
    const response = await api.get<Manager[]>('/employer/managers');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to fetch managers';
    throw new Error(errorMessage);
  }
};

// Create a new manager
export const createManager = async (managerData: CreateManagerPayload): Promise<Manager> => {
  try {
    const response = await api.post<Manager>('/employer/managers', managerData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to create manager';
    throw new Error(errorMessage);
  }
};

// Update a manager
export const updateManager = async (managerId: string, managerData: UpdateManagerPayload): Promise<Manager> => {
  try {
    const response = await api.put<Manager>(`/employer/managers/${managerId}`, managerData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to update manager';
    throw new Error(errorMessage);
  }
};

// Delete a manager
export const deleteManager = async (managerId: string): Promise<{ msg: string }> => {
  try {
    const response = await api.delete<{ msg: string }>(`/employer/managers/${managerId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to delete manager';
    throw new Error(errorMessage);
  }
};

// Get leads with optional filtering
export const getLeads = async (filters?: LeadFilters): Promise<Lead[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.managerId) params.append('managerId', filters.managerId);
    if (filters?.status) params.append('status', filters.status);
    
    const url = `/employer/leads${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<Lead[]>(url);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to fetch leads';
    throw new Error(errorMessage);
  }
};

// Create a new lead
export const createLead = async (leadData: CreateLeadPayload): Promise<Lead> => {
  try {
    const response = await api.post<Lead>('/employer/leads', leadData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to create lead';
    throw new Error(errorMessage);
  }
};

// Update a lead
export const updateLead = async (leadId: string, leadData: UpdateLeadPayload): Promise<Lead> => {
  try {
    const response = await api.put<Lead>(`/employer/leads/${leadId}`, leadData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to update lead';
    throw new Error(errorMessage);
  }
};

// Delete a lead
export const deleteLead = async (leadId: string): Promise<{ msg: string }> => {
  try {
    const response = await api.delete<{ msg: string }>(`/employer/leads/${leadId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to delete lead';
    throw new Error(errorMessage);
  }
};
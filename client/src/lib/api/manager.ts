import api from './axios';
import { Lead } from './employer';

export interface UpdateLeadStatusPayload {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  notes?: string | string[];
}

// Get leads assigned to the current manager
export const getManagerLeads = async (): Promise<Lead[]> => {
  try {
    const response = await api.get<Lead[]>('/manager/leads');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to fetch leads';
    throw new Error(errorMessage);
  }
};

// Update lead status or add notes
export const updateLeadStatus = async (leadId: string, data: UpdateLeadStatusPayload): Promise<Lead> => {
  try {
    const response = await api.patch<Lead>(`/manager/leads/${leadId}`, data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to update lead';
    throw new Error(errorMessage);
  }
};
import api from './axios';
import { Lead } from './employer';

export const getAssignedLeads = async () => {
  const response = await api.get<Lead[]>('/manager/leads');
  return response.data;
};

export const updateLeadStatus = async (
  leadId: string,
  data: { status: string; notes: string }
) => {
  const response = await api.patch<Lead>(`/manager/leads/${leadId}`, data);
  return response.data;
};
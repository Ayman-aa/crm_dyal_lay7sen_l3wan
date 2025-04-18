import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManagerLeads, updateLeadStatus, UpdateLeadStatusPayload } from '@/lib/api/manager';
import { Lead } from '@/lib/api/employer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  Loader2,
  MessageSquarePlus,
  CheckCircle,
  XCircle,
  Clock,
  CircleDot
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { queryKeys } from '@/lib/api/queryClient';

// Form type for lead status updates
type LeadUpdateFormData = {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  notes: string;
};

const LeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form methods for Update Lead
  const updateForm = useForm<LeadUpdateFormData>({
    defaultValues: {
      status: 'PENDING',
      notes: ''
    }
  });

  // Fetch leads assigned to the current manager
  const { 
    data: leads, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: queryKeys.managerLeads,
    queryFn: getManagerLeads,
  });

  // Update lead status mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadStatusPayload }) => 
      updateLeadStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.managerLeads });
      setIsUpdateDialogOpen(false);
      updateForm.reset();
      setSelectedLead(null);
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Handle update form submission
  const handleUpdateSubmit = updateForm.handleSubmit((data) => {
    if (!selectedLead) return;
    
    const { status, notes } = data;
    
    const payload: UpdateLeadStatusPayload = {};
    if (status) payload.status = status;
    if (notes) payload.notes = notes;
    
    setFormError(null);
    updateLeadMutation.mutate({
      id: selectedLead._id,
      data: payload
    });
  });

  // Open Update Dialog
  const openUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    
    updateForm.reset({
      status: lead.status,
      notes: '' // Start with empty notes field for adding new notes
    });
    
    setFormError(null);
    setIsUpdateDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status badge color class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'IN_PROGRESS':
        return <CircleDot className="h-4 w-4 mr-1" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Leads</h1>
      </div>

      {/* Update Lead Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Update the status of this lead or add notes about your progress.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{formError}</span>
              </div>
            )}
            
            {selectedLead && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <h3 className="font-medium mb-1">{selectedLead.companyName}</h3>
                <p className="text-sm text-gray-600">
                  Contact: {selectedLead.contactName} ({selectedLead.contactEmail})
                </p>
              </div>
            )}
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Controller
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELED">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Add Note</label>
              <Textarea
                id="notes"
                {...updateForm.register('notes')}
                placeholder="Add a new note about this lead"
                rows={3}
              />
            </div>
            
            {/* Display existing notes */}
            {selectedLead?.notes && selectedLead.notes.length > 0 && (
              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Previous Notes:</h4>
                <ul className="space-y-2">
                  {selectedLead.notes.map((note, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateLeadMutation.isPending}
              >
                {updateLeadMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leads Table */}
      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading leads...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed to load leads
            </p>
          </div>
        ) : leads && leads.length > 0 ? (
          <Table>
            <TableCaption>A list of leads assigned to you</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>
                    <div className="font-medium">{lead.contactName}</div>
                    <div className="text-sm text-gray-500">{lead.contactEmail}</div>
                  </TableCell>
                  <TableCell>{lead.companyName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusBadgeClass(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(lead.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(lead)}
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <p>No leads assigned to you yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
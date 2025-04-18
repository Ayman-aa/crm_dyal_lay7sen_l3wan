import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryClient';
import { 
  getLeads,
  getManagers,
  createLead,
  updateLead,
  deleteLead,
  Lead,
  Manager,
  CreateLeadPayload,
  UpdateLeadPayload,
  LeadFilters
} from '@/lib/api/employer';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

// Lead form type
type LeadFormData = {
  contactName: string;
  contactEmail: string;
  companyName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  managerId: string;
  notes: string;
};

const LeadsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Form methods for Create Lead
  const createForm = useForm<LeadFormData>({
    defaultValues: {
      contactName: '',
      contactEmail: '',
      companyName: '',
      status: 'PENDING',
      managerId: '',
      notes: ''
    }
  });

  // Form methods for Update Lead
  const updateForm = useForm<LeadFormData>({
    defaultValues: {
      contactName: '',
      contactEmail: '',
      companyName: '',
      status: 'PENDING',
      managerId: '',
      notes: ''
    }
  });

  // Fetch leads
  const { 
    data: leads, 
    isLoading: isLeadsLoading, 
    error: leadsError 
  } = useQuery({
    queryKey: queryKeys.leads(filters),
    queryFn: () => getLeads(filters),
  });

  // Fetch managers for select dropdown
  const { 
    data: managers,
    isLoading: isManagersLoading 
  } = useQuery({
    queryKey: queryKeys.managers,
    queryFn: getManagers,
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: CreateLeadPayload) => createLead(data),
    onSuccess: () => {
      // Invalidate all queries that depend on leads data
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadPayload }) => 
      updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      setIsUpdateDialogOpen(false);
      updateForm.reset();
      setSelectedLead(null);
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Handle create form submission
  const handleCreateSubmit = createForm.handleSubmit((data) => {
    const { contactName, contactEmail, companyName, status, managerId, notes } = data;
    
    setFormError(null);
    createLeadMutation.mutate({
      contactName,
      contactEmail,
      companyName,
      status,
      managerId,
      notes: notes ? [notes] : []
    });
  });

  // Handle update form submission
  const handleUpdateSubmit = updateForm.handleSubmit((data) => {
    if (!selectedLead) return;
    
    const { contactName, contactEmail, companyName, status, managerId, notes } = data;
    
    const payload: UpdateLeadPayload = {};
    if (contactName) payload.contactName = contactName;
    if (contactEmail) payload.contactEmail = contactEmail;
    if (companyName) payload.companyName = companyName;
    if (status) payload.status = status;
    if (managerId) payload.managerId = managerId;
    
    // Handle notes - combine existing and new
    if (notes) {
      const existingNotes = Array.isArray(selectedLead.notes) ? selectedLead.notes : [];
      payload.notes = [...existingNotes, notes];
    }
    
    setFormError(null);
    updateLeadMutation.mutate({
      id: selectedLead._id,
      data: payload
    });
  });

  // Open Update Dialog
  const openUpdateDialog = (lead: Lead) => {
    setSelectedLead(lead);
    
    // Get manager ID from lead
    let managerId = '';
    if (typeof lead.manager === 'string') {
      managerId = lead.manager;
    } else if (lead.manager && typeof lead.manager === 'object') {
      managerId = lead.manager._id;
    }
    
    updateForm.reset({
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      companyName: lead.companyName,
      status: lead.status,
      managerId: managerId,
      notes: ''  // Start with empty notes field for adding new notes
    });
    
    setFormError(null);
    setIsUpdateDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormError(null);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (selectedLead) {
      deleteLeadMutation.mutate(selectedLead._id);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof LeadFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get manager name from either string ID or object
  const getManagerName = (manager: string | { _id: string; name: string; email: string }) => {
    if (typeof manager === 'string') {
      const foundManager = managers?.find(m => m._id === manager);
      return foundManager ? foundManager.name : 'Unknown';
    } else {
      return manager.name;
    }
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

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Create a new lead and assign it to a manager.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="contactName" className="text-sm font-medium">Contact Name</label>
                  <Input
                    id="contactName"
                    {...createForm.register('contactName', { required: true })}
                    placeholder="Full name of contact person"
                  />
                  {createForm.formState.errors.contactName && (
                    <p className="text-red-500 text-xs">Contact name is required</p>
                  )}
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...createForm.register('contactEmail', { required: true })}
                    placeholder="contact@example.com"
                  />
                  {createForm.formState.errors.contactEmail && (
                    <p className="text-red-500 text-xs">Contact email is required</p>
                  )}
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="companyName"
                    {...createForm.register('companyName', { required: true })}
                    placeholder="Company name"
                  />
                  {createForm.formState.errors.companyName && (
                    <p className="text-red-500 text-xs">Company name is required</p>
                  )}
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Controller
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
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
                  <label htmlFor="managerId" className="text-sm font-medium">Assign to Manager</label>
                  <Controller
                    control={createForm.control}
                    name="managerId"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {managers?.map((manager) => (
                            <SelectItem key={manager._id} value={manager._id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {createForm.formState.errors.managerId && (
                    <p className="text-red-500 text-xs">Manager is required</p>
                  )}
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <Textarea
                    id="notes"
                    {...createForm.register('notes')}
                    placeholder="Any additional information about this lead"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLeadMutation.isPending || isManagersLoading}
                  >
                    {createLeadMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Lead
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-4 mb-6 rounded-md shadow border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Filter Leads</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              disabled={!filters.managerId && !filters.status}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="managerFilter" className="block text-sm font-medium mb-1">Manager</label>
              <Select
                value={filters.managerId}
                onValueChange={(value) => handleFilterChange('managerId', value)}
                disabled={isManagersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Managers</SelectItem>
                  {managers?.map((manager) => (
                    <SelectItem key={manager._id} value={manager._id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Lead Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead</DialogTitle>
            <DialogDescription>
              Update lead information and assign to a different manager if needed.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{formError}</span>
              </div>
            )}
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="contactName" className="text-sm font-medium">Contact Name</label>
              <Input
                id="contactName"
                {...updateForm.register('contactName')}
                placeholder="Full name of contact person"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</label>
              <Input
                id="contactEmail"
                type="email"
                {...updateForm.register('contactEmail')}
                placeholder="contact@example.com"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
              <Input
                id="companyName"
                {...updateForm.register('companyName')}
                placeholder="Company name"
              />
            </div>
            
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
              <label htmlFor="managerId" className="text-sm font-medium">Assign to Manager</label>
              <Controller
                control={updateForm.control}
                name="managerId"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isManagersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers?.map((manager) => (
                        <SelectItem key={manager._id} value={manager._id}>
                          {manager.name}
                        </SelectItem>
                      ))}
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
                placeholder="Add a new note to this lead"
                rows={3}
              />
            </div>
            
            {/* Display existing notes */}
            {selectedLead?.notes && selectedLead.notes.length > 0 && (
              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Existing Notes:</h4>
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
      
      {/* Delete Lead Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead for {selectedLead?.companyName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLeadMutation.isPending}
            >
              {deleteLeadMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leads Table */}
      <div className="bg-white rounded-md shadow">
        {isLeadsLoading || isManagersLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading leads...</span>
          </div>
        ) : leadsError ? (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed to load leads
            </p>
          </div>
        ) : leads && leads.length > 0 ? (
          <Table>
            <TableCaption>A list of all leads in your organization.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Updated</TableHead>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>{getManagerName(lead.manager)}</TableCell>
                  <TableCell>{formatDate(lead.updatedAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(lead)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(lead)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <p>No leads found. Create your first lead using the 'Add Lead' button.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsList;
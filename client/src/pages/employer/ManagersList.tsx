import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getManagers,
  createManager,
  updateManager,
  deleteManager,
  Manager,
  CreateManagerPayload,
  UpdateManagerPayload
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Loader2 
} from 'lucide-react';
import { useForm } from 'react-hook-form';

// Manager form type
type ManagerFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

const ManagersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form methods for Create Manager
  const createForm = useForm<ManagerFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Form methods for Update Manager
  const updateForm = useForm<ManagerFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  // Fetch managers
  const { data: managers, isLoading, error } = useQuery({
    queryKey: ['managers'],
    queryFn: getManagers,
  });

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: (data: CreateManagerPayload) => createManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Update manager mutation
  const updateManagerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManagerPayload }) => 
      updateManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      setIsUpdateDialogOpen(false);
      updateForm.reset();
      setSelectedManager(null);
      setFormError(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Delete manager mutation
  const deleteManagerMutation = useMutation({
    mutationFn: (id: string) => deleteManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      setIsDeleteDialogOpen(false);
      setSelectedManager(null);
    },
    onError: (error: Error) => {
      setFormError(error.message);
    }
  });

  // Handle create form submission
  const handleCreateSubmit = createForm.handleSubmit((data) => {
    const { name, email, password, confirmPassword } = data;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }

    setFormError(null);
    createManagerMutation.mutate({
      name,
      email,
      password,
    });
  });

  // Handle update form submission
  const handleUpdateSubmit = updateForm.handleSubmit((data) => {
    if (!selectedManager) return;
    
    const payload: UpdateManagerPayload = {};
    if (data.name) payload.name = data.name;
    if (data.email) payload.email = data.email;
    if (data.password) payload.password = data.password;
    
    setFormError(null);
    updateManagerMutation.mutate({
      id: selectedManager._id,
      data: payload
    });
  });

  // Open Update Dialog
  const openUpdateDialog = (manager: Manager) => {
    setSelectedManager(manager);
    updateForm.reset({
      name: manager.name,
      email: manager.email,
      password: '',
    });
    setFormError(null);
    setIsUpdateDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setFormError(null);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (selectedManager) {
      deleteManagerMutation.mutate(selectedManager._id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Managers</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
              <DialogDescription>
                Create a new manager account to assign leads.
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
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  {...createForm.register('name', { required: true })}
                  placeholder="Manager's full name"
                />
                {createForm.formState.errors.name && (
                  <p className="text-red-500 text-xs">Name is required</p>
                )}
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  {...createForm.register('email', { required: true })}
                  placeholder="manager@example.com"
                />
                {createForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">Email is required</p>
                )}
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  {...createForm.register('password', { required: true, minLength: 6 })}
                  placeholder="Minimum 6 characters"
                />
                {createForm.formState.errors.password && (
                  <p className="text-red-500 text-xs">Password must be at least 6 characters</p>
                )}
              </div>
              
              <div className="grid w-full items-center gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...createForm.register('confirmPassword', { required: true })}
                  placeholder="Confirm password"
                />
                {createForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs">Please confirm the password</p>
                )}
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
                  disabled={createManagerMutation.isPending}
                >
                  {createManagerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Manager
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Update Manager Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Manager</DialogTitle>
            <DialogDescription>
              Update manager information. Leave password blank to keep unchanged.
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
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                {...updateForm.register('name')}
                placeholder="Manager's full name"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                {...updateForm.register('email')}
                placeholder="manager@example.com"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <label htmlFor="password" className="text-sm font-medium">New Password (Optional)</label>
              <Input
                id="password"
                type="password"
                {...updateForm.register('password')}
                placeholder="Leave blank to keep current password"
              />
              {updateForm.formState.errors.password && (
                <p className="text-red-500 text-xs">Password must be at least 6 characters</p>
              )}
            </div>
            
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
                disabled={updateManagerMutation.isPending}
              >
                {updateManagerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Manager
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Manager Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manager</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedManager?.name}? This action cannot be undone.
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
              disabled={deleteManagerMutation.isPending}
            >
              {deleteManagerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Managers Table */}
      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading managers...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Failed to load managers
            </p>
          </div>
        ) : managers && managers.length > 0 ? (
          <Table>
            <TableCaption>A list of all managers in your organization.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager._id}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{formatDate(manager.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(manager)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(manager)}
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
            <p>No managers found. Create your first manager using the 'Add Manager' button.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagersList;
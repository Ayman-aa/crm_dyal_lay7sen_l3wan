import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getLeads, createLead, updateLead, getManagers, Manager } from '../../lib/api/employer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const CreateEditLead: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [managers, setManagers] = useState<Manager[]>([]);
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    companyName: '',
    status: 'PENDING',
    managerId: '',
    notes: ''
  });

    const [validationError, setValidationError] = useState<string | null>(null);
  // Check if form is valid - require managerId to be non-empty
  const isFormValid = formData.companyName && formData.contactName && formData.contactEmail && formData.managerId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELED', label: 'Canceled' }
  ];

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await getManagers();
        setManagers(data);
        
        // Set default manager if available and not in edit mode
        if (data.length > 0 && !isEditMode) {
          setFormData(prev => ({ ...prev, managerId: data[0].id }));
        } else if (data.length === 0) {
          setValidationError('No managers available. Please create a manager before adding leads.');
        }
      } catch (err: any) {
        console.error('Failed to load managers:', err);
      }
    };

    fetchManagers();
  }, [isEditMode]);

  useEffect(() => {
    const fetchLead = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const leads = await getLeads();
          const lead = leads.find(l => l.id === id);
          
          if (lead) {
            setFormData({
              contactName: lead.contactName,
              contactEmail: lead.contactEmail,
              companyName: lead.companyName,
              status: lead.status,
              managerId: lead.manager.id,
              notes: lead.notes || ''
            });
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load lead details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLead();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Setting ${name} to:`, value, 'Type:', typeof value);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'managerId' && !value) {
      setValidationError('Please select a manager');
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate managerId first - moved to the top of the function
    if (!formData.managerId) {
      setValidationError('Please select a manager');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setValidationError(null);
      
      if (isEditMode && id) {
        await updateLead(id, formData);
      } else {
        await createLead(formData);
      }
      
      navigate('/employer/leads');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} lead`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/employer/leads')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Lead' : 'Add Lead'}</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {validationError && (
        <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {validationError}
          {validationError.includes('No managers available') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/employer/managers/create')}
              className="ml-4"
            >
              Create Manager
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Lead Details' : 'New Lead Information'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contactName" className="text-sm font-medium">
                  Contact Name
                </label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="contactEmail" className="text-sm font-medium">
                  Contact Email
                </label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="managerId" className="text-sm font-medium">
                  Assign Manager <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={String(formData.managerId)} 
                  onValueChange={(value) => handleSelectChange('managerId', value)}
                  required
                >
                  <SelectTrigger className={`w-full ${!formData.managerId ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.length > 0 ? (
                      managers.map((manager) => (
                        <SelectItem key={manager.id} value={String(manager.id)}>
                          {manager.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-managers" disabled>No managers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!formData.managerId && (
                  <p className="text-red-500 text-xs mt-1">Manager selection is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employer/leads')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid || managers.length === 0}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Lead' : 'Create Lead'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default CreateEditLead;
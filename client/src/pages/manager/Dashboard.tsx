import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getManagerLeads } from '@/lib/api/manager';
import { queryKeys } from '@/lib/api/queryClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: queryKeys.managerLeads,
    queryFn: getManagerLeads,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md">
          <p>Failed to load leads data. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate lead statistics
  const pendingCount = leads?.filter(lead => lead.status === 'PENDING').length || 0;
  const inProgressCount = leads?.filter(lead => lead.status === 'IN_PROGRESS').length || 0;
  const completedCount = leads?.filter(lead => lead.status === 'COMPLETED').length || 0;
  const canceledCount = leads?.filter(lead => lead.status === 'CANCELED').length || 0;
  const totalLeads = leads?.length || 0;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <AlertCircle className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total leads assigned to you
            </p>
          </CardContent>
        </Card>

        {/* Pending Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads waiting to be processed
            </p>
          </CardContent>
        </Card>

        {/* In Progress Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads currently being worked on
            </p>
          </CardContent>
        </Card>

        {/* Completed Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully converted leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Leads</h2>
          <Link to="/manager/leads" className="text-blue-500 hover:underline text-sm">
            View All Leads
          </Link>
        </div>

        {leads && leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium">{lead.contactName}</div>
                      <div className="text-xs text-gray-500">{lead.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">{lead.companyName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        lead.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No leads assigned to you yet.</p>
        )}
      </div>

      {/* Link to leads page */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Manage My Leads</h3>
            <p className="text-sm text-gray-500">View and update the status of leads assigned to you.</p>
            <Link to="/manager/leads" className="text-blue-500 text-sm mt-2 inline-block hover:underline">
              Go to My Leads →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
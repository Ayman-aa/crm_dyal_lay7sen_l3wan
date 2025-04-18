// src/pages/employer/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/employer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
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
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* In Progress Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leads In Progress</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.inProgressCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads in PENDING and IN_PROGRESS status
            </p>
          </CardContent>
        </Card>

        {/* Completed Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leads Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completedCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads successfully converted
            </p>
          </CardContent>
        </Card>

        {/* Canceled Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leads Canceled</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.canceledCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads that were canceled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional information or charts could be added here */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Manage Leads</h3>
            <p className="text-sm text-gray-500">Create, update, and assign leads to managers</p>
            <a href="/employer/leads" className="text-blue-500 text-sm mt-2 inline-block hover:underline">
              Go to Leads →
            </a>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Manage Team</h3>
            <p className="text-sm text-gray-500">Add, update, or remove managers from your team</p>
            <a href="/employer/managers" className="text-blue-500 text-sm mt-2 inline-block hover:underline">
              Go to Managers →
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
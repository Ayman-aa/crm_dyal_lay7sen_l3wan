// src/pages/employer/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api/employer';
import { queryKeys } from '@/lib/api/queryClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  Users,
  FileText
} from 'lucide-react';

// Import Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

const EmployerDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboardStats,
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

  // Calculate total leads
  const totalLeads = 
    (stats?.inProgressCount || 0) + 
    (stats?.completedCount || 0) + 
    (stats?.canceledCount || 0);

  // Chart data
  const chartData = {
    labels: ['In Progress', 'Completed', 'Canceled'],
    datasets: [
      {
        data: [
          stats?.inProgressCount || 0,
          stats?.completedCount || 0,
          stats?.canceledCount || 0
        ],
        backgroundColor: [
          'rgb(var(--color-chart-2))',
          'rgb(var(--color-chart-1))',
          'rgb(var(--color-chart-5))'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats?.inProgressCount || 0}</div>
                <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/50">
                  <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Completed Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats?.completedCount || 0}</div>
                <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/50">
                  <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Canceled Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{stats?.canceledCount || 0}</div>
                <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                  <XCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Quick Links */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Doughnut Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Leads Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {totalLeads > 0 ? (
                  <Doughnut data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No leads data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link 
                to="/employer/managers"
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Manage Managers</span>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              
              <Link 
                to="/employer/leads"
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span>Manage Leads</span>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
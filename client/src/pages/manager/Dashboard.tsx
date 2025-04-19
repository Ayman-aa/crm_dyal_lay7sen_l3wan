import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getManagerLeads } from '@/lib/api/manager';
import { queryKeys } from '@/lib/api/queryClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  FileText,
  CircleDot
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
import { Pie } from 'react-chartjs-2';

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

const ManagerDashboard: React.FC = () => {
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
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate leads by status
  const pendingCount = leads?.filter(lead => lead.status === 'PENDING').length || 0;
  const inProgressCount = leads?.filter(lead => lead.status === 'IN_PROGRESS').length || 0;
  const completedCount = leads?.filter(lead => lead.status === 'COMPLETED').length || 0;
  const canceledCount = leads?.filter(lead => lead.status === 'CANCELED').length || 0;
  const totalLeads = leads?.length || 0;

  // Chart data
  const chartData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Canceled'],
    datasets: [
      {
        data: [pendingCount, inProgressCount, completedCount, canceledCount],
        backgroundColor: [
          'rgb(var(--color-chart-4))',
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

  // Get the most recent leads (up to 3)
  const recentLeads = [...(leads || [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{pendingCount}</div>
                <div className="rounded-full bg-yellow-100 p-1.5 dark:bg-yellow-900/50">
                  <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{inProgressCount}</div>
                <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/50">
                  <CircleDot className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{completedCount}</div>
                <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/50">
                  <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Canceled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{canceledCount}</div>
                <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                  <XCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Recent Leads */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Pie Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Leads Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {totalLeads > 0 ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No leads assigned to you yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead._id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="font-medium">{lead.companyName}</div>
                    <div className="text-sm text-muted-foreground">{lead.contactName}</div>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs 
                        ${lead.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          lead.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                          lead.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                          'bg-red-100 text-red-700'}`}
                      >
                        {lead.status === 'COMPLETED' && <CheckCircle className="mr-1 h-3 w-3" />}
                        {lead.status === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                        {lead.status === 'IN_PROGRESS' && <CircleDot className="mr-1 h-3 w-3" />}
                        {lead.status === 'CANCELED' && <XCircle className="mr-1 h-3 w-3" />}
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recent leads</p>
                </div>
              )}
              
              <Link 
                to="/manager/leads"
                className="flex items-center justify-between p-3 mt-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span>View All Leads</span>
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

export default ManagerDashboard;
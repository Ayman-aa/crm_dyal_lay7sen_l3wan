import React, { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, BarChart, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEmployer = user?.role === 'employer';
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">CRM System</h1>
        </div>

        <div className="py-4">
          <nav className="mt-2">
            {isEmployer ? (
              <>
                <Link 
                  to="/employer/dashboard" 
                  className={`flex items-center px-6 py-2 ${isActivePath('/employer/dashboard') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/employer/leads" 
                  className={`flex items-center px-6 py-2 ${isActivePath('/employer/leads') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Leads
                </Link>
                <Link 
                  to="/employer/managers" 
                  className={`flex items-center px-6 py-2 ${isActivePath('/employer/managers') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Managers
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/manager/dashboard" 
                  className={`flex items-center px-6 py-2 ${isActivePath('/manager/dashboard') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/manager/leads" 
                  className={`flex items-center px-6 py-2 ${isActivePath('/manager/leads') ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Leads
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <h2 className="text-lg font-medium">
            {isEmployer ? 'Employer Dashboard' : 'Manager Dashboard'}
          </h2>
          
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <User className="w-5 h-5 mr-2" />
              <span>{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
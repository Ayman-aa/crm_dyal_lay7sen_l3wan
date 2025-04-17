import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">CRM System</h2>
        </div>
        <nav className="p-4">
          {user?.role === 'employer' ? (
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/employer/dashboard" 
                  className="block p-2 rounded hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/employer/managers" 
                  className="block p-2 rounded hover:bg-gray-100"
                >
                  Managers
                </Link>
              </li>
              <li>
                <Link 
                  to="/employer/leads" 
                  className="block p-2 rounded hover:bg-gray-100"
                >
                  Leads
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/manager/dashboard" 
                  className="block p-2 rounded hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/manager/leads" 
                  className="block p-2 rounded hover:bg-gray-100"
                >
                  My Leads
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {user?.role === 'employer' ? 'Employer Dashboard' : 'Manager Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <span>{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
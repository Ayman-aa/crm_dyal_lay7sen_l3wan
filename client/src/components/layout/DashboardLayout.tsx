import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSidebar,
} from '@/components/ui/layout';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Users,
  FileText,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEmployer = user?.role === 'employer';
  const isManager = user?.role === 'manager';

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      {/* Mobile header */}
      <LayoutHeader className="lg:hidden flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-lg font-semibold ml-2">CRM System</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user?.name}</span>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </LayoutHeader>

      {/* Sidebar */}
      <LayoutSidebar 
        collapsed={collapsed}
        className={`bg-sidebar text-sidebar-foreground ${mobileMenuOpen ? 'block' : 'hidden'} lg:block transition-all duration-300 ease-in-out`}
      >
        {/* Logo & Brand */}
        <div className={`flex items-center justify-between p-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && <span className="text-xl font-bold">CRM System</span>}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={toggleSidebar}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* User Info */}
        <div className={`flex items-center gap-3 p-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="bg-sidebar-accent text-sidebar-accent-foreground h-10 w-10 rounded-full flex items-center justify-center font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {isEmployer && (
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/employer/dashboard" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActivePath('/employer/dashboard') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-2" />
                  {!collapsed && <span>Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/employer/managers" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActivePath('/employer/managers') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5 mr-2" />
                  {!collapsed && <span>Managers</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/employer/leads" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActivePath('/employer/leads') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {!collapsed && <span>Leads</span>}
                </Link>
              </li>
            </ul>
          )}

          {isManager && (
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/manager/dashboard" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActivePath('/manager/dashboard') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-2" />
                  {!collapsed && <span>Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/manager/leads" 
                  className={`flex items-center px-4 py-2 rounded-md ${isActivePath('/manager/leads') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {!collapsed && <span>My Leads</span>}
                </Link>
              </li>
            </ul>
          )}
        </nav>

        {/* Logout Button */}
        <div className={`mt-auto p-4 border-t border-sidebar-border ${collapsed ? 'flex justify-center' : ''}`}>
          <Button 
            variant="outline" 
            onClick={() => logout()}
            className={`${collapsed ? 'w-10 p-0 justify-center' : 'w-full'} border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </LayoutSidebar>

      {/* Main Content */}
      <LayoutContent className="p-6">
        {children}
      </LayoutContent>
    </Layout>
  );
};

export default DashboardLayout;
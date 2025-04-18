import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'employer' | 'manager'>;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = [], 
  children 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state if still checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified and user exists
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (user.role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    }
    
    // Fallback to login if role is invalid
    return <Navigate to="/login" replace />;
  }

  // If children are provided, render them, otherwise render an Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
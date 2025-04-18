import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import EmployerDashboard from './pages/employer/Dashboard';
import ManagersList from './pages/employer/ManagersList';
import LeadsList from './pages/employer/LeadsList';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLeadsPage from './pages/manager/LeadsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Employer Routes */}
          <Route 
            path="/employer/*" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <Routes>
                  <Route path="dashboard" element={<EmployerDashboard />} />
                  <Route path="managers" element={<ManagersList />} />
                  <Route path="leads" element={<LeadsList />} />
                  <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          {/* Protected Manager Routes */}
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Routes>
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  <Route path="leads" element={<ManagerLeadsPage />} />
                  <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 - Redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';

// Note: Your other pages will be imported here
// For now, let's use placeholder components for other pages
const EmployerDashboard = () => <div>Employer Dashboard</div>;
const ManagerDashboard = () => <div>Manager Dashboard</div>;

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
                  {/* Add your other employer routes here */}
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
                  {/* Add your other manager routes here */}
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
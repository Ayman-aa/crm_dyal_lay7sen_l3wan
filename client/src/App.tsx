import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';


import EmployerDashboard from './pages/employer/Dashboard';
import ManagersList from './pages/employer/ManagersList';
import LeadsList from './pages/employer/LeadsList';
import CreateEditManager from './pages/employer/CreateEditManager';
import CreateEditLead from './pages/employer/CreateEditLead';

import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLeads from './pages/manager/LeadsList';
import UpdateLead from './pages/manager/UpdateLead';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Employer Routes */}
          <Route 
            path="/employer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/managers" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <ManagersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/managers/create" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CreateEditManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/managers/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CreateEditManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/leads" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <LeadsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/leads/create" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CreateEditLead />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/leads/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <CreateEditLead />
              </ProtectedRoute>
            } 
          />
          
          {/* Manager Routes */}
          <Route 
            path="/manager/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/leads" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerLeads />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/leads/:id" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <UpdateLead />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
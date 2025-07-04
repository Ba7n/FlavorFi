import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // If user is not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;

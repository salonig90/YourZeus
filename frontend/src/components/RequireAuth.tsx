import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // redirect to signup/login page, preserve location
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
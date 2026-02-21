import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/user/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={`/${user?.role}/dashboard`} />;
  }

  return children;
};

export default PrivateRoute;
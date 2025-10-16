// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from './api';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      await api.getProfile();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    }
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
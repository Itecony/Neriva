import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from './api';

export default function ProtectedRoute({ children }) {
  // 1. OPTIMISTIC CHECK: If token exists, assume true initially
  const hasToken = !!localStorage.getItem('authToken');
  const [isAuthenticated, setIsAuthenticated] = useState(hasToken);

  useEffect(() => {
    if (hasToken) {
      verifyToken();
    }
  }, []);

  const verifyToken = async () => {
    try {
      // Check if token is actually valid on server
      await api.getProfile(); 
      // If successful, do nothing (we are already rendering children)
    } catch (error) {
      // If invalid, THEN kick user out
      console.error("Session expired", error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
    }
  };

  // 2. If no token exists at all, redirect login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 3. Render children IMMEDIATELY (No "Loading..." screen)
  return children;
}
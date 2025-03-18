import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Get user data from localStorage

  useEffect(() => {
    if (token && user) {
      // Check if the token exists and the user is properly stored
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [token, user]);

  if (isLoading) {
    return <div>Loading...</div>; // Optionally show a loading spinner while verifying
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children; // Only render children if authenticated
};

export default ProtectedRoute;

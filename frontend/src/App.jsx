import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Signin from "./auth/SignIn";
import Signup from "./auth/SignUp";
import Dashboard from "./pages/DashBoard";
import ProtectedRoute from "./components/ProtectedRoute"; // Protected Route for role-based access
import FacultyManagement from "./pages/FacultyManagement";
import ClubUnionManagement from "./pages/ClubUnionManagement";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import ManageEvent from "./pages/ManageEvent";
import TokenExpire from "./components/TokenExpire";

const App = () => {
  return (
    <BrowserRouter>
      <TokenExpirationHandler />
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/faculty-management" element={<FacultyManagement />} />
        <Route path="/admin/club-management" element={<ClubUnionManagement />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/manage-event" element={<ManageEvent />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<div className="text-red-500 text-center p-8">Page Not Found</div>}
        />
      </Routes>
    </BrowserRouter>
  );
};

const TokenExpirationHandler = () => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const navigate = useNavigate();

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        setIsTokenExpired(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsTokenExpired(false);
    toast.error("Session expired. Please log in again.");
    navigate("/signin");
  };

  if (isTokenExpired) {
    return (
      <TokenExpire
        title="Session Expired"
        message="Your session has expired. Please log in again."
        onConfirm={handleLogout}
      />
    );
  }

  return null;
};

export default App;

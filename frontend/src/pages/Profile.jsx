import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // Import Navbar
import axios from "axios";
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  const handlePasswordChange = async () => {
    if (!user || !user._id) {
      console.error("User ID is missing:", user);
      toast.error("User information is invalid. Please log in again.");
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
  
    try {
      const response = await axios.put("http://localhost:5000/auth/change-password", {
        userId: user._id,
        password,
      });
  
      if (response.status === 200) {
        toast.success("Password changed successfully!");
        setIsModalOpen(false);
  
        // Update the user object in state and localStorage
        const updatedUser = { ...user, isPasswordChanged: true };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
  
        // Reload the page to reflect the updated user state
        window.location.reload();
      } else {
        toast.error(response.data || "Error changing password. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };
  

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar /> {/* Add Navbar here */}
      <div className="flex items-center justify-center min-h-[100vh] bg-gray-100">
        <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">User Profile</h2>
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-lg mb-2 mt-4">
              {user.username ? user.username[0].toUpperCase() : "N/A"}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              <span className="font-medium">Username:</span> {user.username || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user.email || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Role:</span> {user.role || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Faculty:</span> {user.faculty || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Department:</span> {user.department || "N/A"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Last Active:</span>{" "}
              {user.lastActive ? new Date(user.lastActive).toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="mt-6">
            <button
              disabled={user.isPasswordChanged} // Disable the button if isPasswordChanged is true
              onClick={() => setIsModalOpen(true)}
              className={`w-full px-4 py-2 rounded ${
                user.isPasswordChanged
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Styling for disabled button
                  : "bg-blue-500 text-white hover:bg-blue-600" // Styling for enabled button
              }`}
            >
              Change Password
            </button>
            {user.isPasswordChanged && (
              <p className="mt-2 text-center text-red-500">
                Contact Admin to change the password.
              </p>
            )}
          </div>

          {/* Password Change Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save Password
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;

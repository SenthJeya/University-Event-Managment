import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route
  const user = JSON.parse(localStorage.getItem("user")); // Get user data from localStorage
  const role = user?.role; // Get user role from the user object

  // State to toggle the dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for dropdown container

  const handleLogout = () => {
    // Remove user data and token from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleViewProfile = () => {
    navigate("/profile"); // Navigate to the Profile page
    setIsDropdownOpen(false); // Close the dropdown after navigation
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const roleToRouteMap = {
    Admin: "/admin-dashboard",
    "Vice Chancellor": "/vc-dashboard",
    Dean: "/dean-dashboard",
    "Head of Department": "/hod-dashboard",
    "Academic Staff": "/lecturer-dashboard",
    Student: "/student-dashboard",
  };

  const homePath = roleToRouteMap[role] || "/"; // Default to "/" if role is not in the map

  // Define role-based tabs
  const renderRoleSpecificTabs = () => {
    if (role === "Admin") {
      return null;
    }
    return (
      <>
        {/* Manage Events Tab */}
        <Link
          to="/manage-event"
          className={`px-4 py-2 ${
            location.pathname === "/manage-event"
              ? "text-gray-500"
              : "hover:text-gray-500"
          }`}
        >
          Manage Events
        </Link>
       
        <Link
          to="/create-event"
          className={`px-4 py-2 ${
            location.pathname === "/create-event"
              ? "text-gray-500"
              : "hover:text-gray-500"
          }`}
        >
          Create Events
        </Link>
      </>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold pl-4">Welcome, {user?.username}</h2>
          <h3 className="text-sm pl-4 pt-1">
            {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : ""}
          </h3>
        </div>

        <div className="space-x-4 flex items-center">
          {/* Home Tab with active state check */}
          <Link
            to="/dashboard"
            className={`px-4 py-2 ${
              location.pathname === "/dashboard" ? "text-gray-500" : "hover:text-gray-500"
            }`}
          >
            Home
          </Link>

          {renderRoleSpecificTabs()}

          {/* Profile Tab with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={`px-4 py-2 ${
                location.pathname === "/profile" ? "text-gray-500" : "hover:text-gray-500"
              }`}
              onClick={toggleDropdown}
            >
              Profile
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-black text-white shadow-md rounded-md w-40">
                <button
                  className="block w-full text-left px-4 py-2 hover:text-gray-500"
                  onClick={handleViewProfile}
                >
                  View Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:text-gray-500"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;








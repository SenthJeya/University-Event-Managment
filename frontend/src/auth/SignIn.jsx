import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  // Initialize react-toastify
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  const handleUpdateLastActive = async (email) => {
    try {
      await axios.put("http://localhost:5000/auth/updateLastActive", { email });
    } catch (err) {
      console.error("Failed to update last active:", err.response?.data || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/signin", { email, password });

      if (res.data && res.data.token && res.data.user) {
        const { token, user } = res.data;
        const role = user.role;

        // Check if the role exists
        if (!role) {
          notifyError("User role not defined. Contact Admin.");
          return;
        }

        // Store token and user data in local storage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        console.log(JSON.parse(localStorage.getItem("user")));

        notifySuccess("Sign-In Successful! Redirecting...");

        // Update lastActive
        await handleUpdateLastActive(email);

        // Redirect user based on their role
        setTimeout(() => {
          if (
            ["Admin", "Vice Chancellor", "Dean", "Head of Department", "Academic Staff", "Student"].includes(role)
          ) {
            navigate("/dashboard");
          } else {
            notifyError("Invalid role. Please contact admin.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }, 500); // Delay redirection for a smooth experience
      } else {
        notifyError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        notifyError(err.response.data.error || "An error occurred. Please try again.");
      } else {
        notifyError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-purple-200 flex items-center justify-center flex-col">

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-2xl"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-2xl"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-xl"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Signin;

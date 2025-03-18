import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lastUsers, setLastUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/faculties");
        setFaculties(response.data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };

    const fetchLastUsers = async () => {
      try {
        setIsLoading(true); // Indicate loading starts
        const response = await axios.get("http://localhost:5000/auth/all-users");
        setLastUsers(response.data); // Update state with fetched users
      } catch (err) {
        console.error("Error fetching users:", err); // Log any errors
      } finally {
        setIsLoading(false); // Ensure loading ends in both success and failure
      }
    };
    
    fetchFaculties();
    fetchLastUsers();
    
    }, []);
    

  useEffect(() => {
    if (faculty && !["Admin", "Vice Chancellor", "Dean"].includes(role)) {
      const fetchDepartments = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/auth/departments/${faculty}`
          );
          setDepartments(response.data);
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
      };

      fetchDepartments();
    }
  }, [faculty, role]);





  const generatePassword = () => {
    const passwordLength = 12;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    setPassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Skip faculty and department validation based on role
    if (
      !username ||
      !email ||
      !password ||
      !role ||
      // Only check for faculty if the role requires it
      (!["Admin", "Vice Chancellor"].includes(role) && !faculty) ||
      // Check for department only if role is not dean
      (!(["Admin", "Vice Chancellor", "Dean"].includes(role)) && !department)
    ) {
      setError("All fields are required.");
      return;
    }
  
    // Get the selected faculty and department names only if needed
    const facultyName = role === "Admin" || role === "Vice Chancellor" ? undefined : faculties.find((fac) => fac._id === faculty)?.name;
    const departmentName = role === "Admin" || role === "Vice Chancellor" || role === "Dean" ? undefined : departments.find((dept) => dept._id === department)?.name;
  
    const dataToSend = {
      username,
      email,
      password,
      role,
    };
  
    // Only add faculty and department if they are required for the role
    if (facultyName) dataToSend.faculty = facultyName;
    if (departmentName) dataToSend.department = departmentName;
  
    console.log(dataToSend);  // Log the request payload for debugging
  
    try {
      setIsLoading(true);
  
      await axios.post("http://localhost:5000/auth/signup", dataToSend);
  
      const response = await axios.get("http://localhost:5000/auth/all-users");
      setLastUsers(response.data);
  
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("");
      setFaculty("");
      setDepartment("");
      setError("");
    } catch (err) {
      console.error(err);  // Log error details for further troubleshooting
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };



  const handleEditUser = (user) => {
    setEditUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setFaculty("");  // Set to empty for admin
    setDepartment("");  // Set to empty for admin
    setShowModal(true); // Show the modal

    // Fetch departments for the selected faculty if user has a faculty
    if (user.faculty) {
      const fetchDepartments = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/auth/departments-by-name/${user.faculty}`
          );
          setDepartments(response.data);
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]); // Ensure departments are empty if there's no faculty
    }
};

  


  const handleSaveEdit = async (e) => {
    e.preventDefault();
  
    // Validate the edited data
    if (!username || !email || !role) {
      setError("All fields are required.");
      return;
    }
  
    const dataToSend = {
      username,
      email,
      password, // Add password if required or leave it as is
      role,
      faculty,
      department,
    };
  
    try {
      setIsLoading(true);
  
      // Update the user by sending the data to the API (replace with your actual API endpoint)
      await axios.put(`http://localhost:5000/auth/update-user/${editUser._id}`, dataToSend);
  
      // Fetch the updated users list
      const response = await axios.get("http://localhost:5000/auth/all-users");
      setLastUsers(response.data);
  
      // Close the modal and reset the form fields
      setShowModal(false);
      setEditUser(null);
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("");
      setFaculty("");
      setDepartment("");
      setError("");
    } catch (err) {
      console.error("Error saving edit:", err);
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleViewUser = (userId) => {
    const user = lastUsers.find((u) => u._id === userId);
    if (user) {
      setViewUser(user);
      setShowViewModal(true);
    }
  };
  
  

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/auth/delete-user/${userId}`);
      const updatedUsers = lastUsers.filter((user) => user._id !== userId);
      setLastUsers(updatedUsers);
      setShowViewModal(false);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    
    // Reset form fields when closing the modal
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
    setFaculty("");
    setDepartment("");
    setError(""); // Reset error message as well
  };
  
  return (
    <div className="min-h-screen bg-white-200">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      )}
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">User Management</h1>
        <div className="flex flex-col space-y-8">
          
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-md"
          >
            <h2 className="text-2xl font-bold text-center mb-4">Create User</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-3/4 p-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Generate
              </button>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Admin">Admin</option>
              <option value="Vice Chancellor">Vice Chancellor</option>
              <option value="Dean">Dean</option>
              <option value="Head of Department">Head of Department</option>
              <option value="Academic Staff">Academic Staff</option>
              <option value="Student">Student</option>
              </select>
              {role === "Dean" ? (
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select Faculty
                </option>
                {faculties.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            ) : role === "Admin" || role === "Vice Chancellor" ? null : (
              <>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                  <option value="" disabled>
                    Select Faculty
                  </option>
                  {faculties.map((fac) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.name}
                    </option>
                  ))}
                </select>

                {faculty && (
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {departments && departments.length > 0 ? (
                      departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No departments available
                      </option>
                    )}
                  </select>
                )}
              </>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            >
              {isLoading ? "Creating..." : "Create User"}
            </button>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
    
          {/* View Modal */}
          {showViewModal && viewUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-1/2 max-w-4xl p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-center">User Details</h2>
              <div className="space-y-4">
                <p>
                  <span className="font-semibold">Username:</span> {viewUser.username}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {viewUser.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {viewUser.role}
                </p>
                <p>
                  <span className="font-semibold">Faculty:</span> {viewUser.faculty || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Department:</span> {viewUser.department || "N/A"}
                </p>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => handleDeleteUser(viewUser._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleSaveEdit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-3/4 p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Generate
                </button>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="Admin">Admin</option>
                <option value="Vice Chancellor">Vice Chancellor</option>
                <option value="Dean">Dean</option>
                <option value="Head of Department">Head of Department</option>
                <option value="Academic Staff">Academic Staff</option>
                <option value="Student">Student</option>
              </select>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select Faculty
                </option>
                {faculties.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name}
                  </option>
                ))}
              </select>
              {role !== "admin" && role !== "vc" && role !== "dean" && (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              >
                {isLoading ? "Updating..." : "Update User"}
              </button>
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )} 
          <div className="w-full flex flex-col">
          <h3 className="text-2xl font-bold mb-4 text-center">Registered Users</h3>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Faculty</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Last Active</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lastUsers.length > 0 ? (
                  lastUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.faculty || "-"}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.department || "-"}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.lastActive ? new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }).format(new Date(user.lastActive)) : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

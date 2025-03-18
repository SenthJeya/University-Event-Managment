import React, { useState, useEffect } from "react";
import axios from "axios";

const FacultyManagement = () => {
  const [facultyName, setFacultyName] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false);
  const [deleteDepartment, setDeleteDepartment] = useState(null); 
  const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] = useState(false);

  const [editFaculty, setEditFaculty] = useState(null);
  const [editDepartment, setEditDepartment] = useState(null);
  const [facultyError, setFacultyError] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteFacultyModalOpen, setIsDeleteFacultyModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null); // Track the faculty to be deleted

  // Fetch faculties with their departments
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true); // Start loading animation
        const response = await axios.get('http://localhost:5000/faculty/list');
        setFaculties(response.data.faculties);
      } catch (err) {
        setError('Error fetching faculties');
      } finally {
        setLoading(false); // Stop loading animation
      }
    };

    fetchFaculties();
  }, []);
  

  // Create or Update Faculty
  const handleSubmitFaculty = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editFaculty) {
        const response = await axios.put(
          `http://localhost:5000/faculty/facultyedit/${editFaculty._id}`,
          { name: facultyName }
        );
        setFaculties(
          faculties.map((faculty) =>
            faculty._id === editFaculty._id
              ? { ...faculty, name: response.data.faculty.name }
              : faculty
          )
        );
      } else {
        const response = await axios.post("http://localhost:5000/faculty/facultycreate", {
          name: facultyName,
        });
        setFaculties([...faculties, response.data.faculty]);
      }
      setFacultyName("");
      setEditFaculty(null);
      setIsFacultyModalOpen(false);
    } catch (error) {
      setFacultyError("Failed to save faculty.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDepartment = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Send POST request to add a new department
      const response = await axios.post(`http://localhost:5000/faculty/department/${editFaculty._id}`,
        { name: departmentName } // Send only the new department
      );
  
      // Check if the response contains the updated faculty object
      if (response.status === 200 && response.data.faculty) {
        const updatedFaculty = response.data.faculty;
  
        // Update the faculties state with the new department
        const updatedFaculties = faculties.map((faculty) =>
          faculty._id === editFaculty._id
            ? { ...faculty, departments: updatedFaculty.departments }
            : faculty
        );
        setFaculties(updatedFaculties);
  
        // Reset the department name and close the modal
        setDepartmentName("");
        setIsDepartmentModalOpen(false);
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      setFacultyError(
        error.response?.data?.message || "Failed to create department."
      );
    } finally {
      setLoading(false);
    }
  };
  
  
  // Delete Faculty
  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/faculty/facultydelete/${facultyToDelete._id}`);
      // Remove the deleted faculty from the list
      setFaculties(faculties.filter((faculty) => faculty._id !== facultyToDelete._id));
      setIsDeleteFacultyModalOpen(false); // Close the modal after deletion
    } catch (error) {
      setFacultyError("Failed to delete faculty.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel Faculty Deletion
  const cancelDeleteFaculty = () => {
    setIsDeleteFacultyModalOpen(false);
    setFacultyToDelete(null);
  };

  // Handle Department Modal Open
  const handleDepartmentModalOpen = (faculty) => {
    setIsDepartmentModalOpen(true);
    setEditFaculty(faculty);
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/faculty/departmentedit/${editFaculty._id}/department/${editDepartment._id}`,
        { name: departmentName }
      );
      setFaculties(
        faculties.map((faculty) =>
          faculty._id === editFaculty._id
            ? { ...faculty, 
                departments: faculty.departments.map((department) =>
                  department._id === editDepartment._id // Find the correct department in that faculty
                    ? { ...department, name: response.data.department.name } // Update the department's name
                    : department // If not the correct department, keep it unchanged
                  ),
              }
            : faculty // If not the correct faculty, keep it unchanged
        )
      );
      
  
      // Close the modal and reset state
      setIsEditDepartmentModalOpen(false);
      setEditDepartment(null);
      setDepartmentName("");
    } catch (error) {
      console.error("Error updating department:", error.response?.data || error.message);
    }
  };
  

  // Delete Department Handler
  const handleDeleteDepartment = async () => {
    try {
      // Send the delete request to the backend
      await axios.delete(`http://localhost:5000/faculty/departmentdelete/${editFaculty._id}/department/${deleteDepartment._id}`);
      
      // Update the state to reflect the department deletion
      setFaculties(
        faculties.map((faculty) =>
          faculty._id === editFaculty._id
            ? { 
                ...faculty, 
                departments: faculty.departments.filter(
                  (department) => department._id !== deleteDepartment._id // Remove the department by matching its _id
                ),
              }
            : faculty // If not the correct faculty, keep it unchanged
        )
      );
      
      // Close modal and reset deleteDepartment state
      setIsDeleteDepartmentModalOpen(false);
      setDeleteDepartment(null);
    } catch (error) {
      console.error("Error deleting department:", error.response?.data || error.message);
    }
  };
  
  return (
    
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Faculty & Department Management</h1>

      {/* Add Faculty Button */}
      <div className="text-right mb-4">
        <button
          onClick={() => {
            setIsFacultyModalOpen(true);
            setEditFaculty(null);
            setFacultyName("");
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Add Faculty
        </button>
      </div>

      {/* Add/Edit Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editFaculty ? "Edit Faculty" : "Create Faculty"}</h2>
            <form onSubmit={handleSubmitFaculty}>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Faculty Name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsFacultyModalOpen(false);
                    setFacultyName("");  // Reset faculty name when closing the modal
                    setEditFaculty(null); // Reset editFaculty to null
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  {editFaculty ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Faculty Confirmation Modal */}
      {isDeleteFacultyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Faculty</h2>
            <p>Are you sure you want to delete this faculty?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={cancelDeleteFaculty}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFaculty}
                className="bg-red-500 text-white px-6 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Faculties */}
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-2">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4">All Faculties</h2>
          {(faculties?.length === 0 || faculties === undefined) ? (
            <p className="text-gray-500">No faculties available. Add one to get started.</p>
          ) : (
            faculties.map((faculty) => (
              <div
                key={faculty._id}
                className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{faculty.name}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setIsFacultyModalOpen(true);
                        setEditFaculty(faculty);
                        setFacultyName(faculty.name);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteFacultyModalOpen(true);
                        setFacultyToDelete(faculty);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleDepartmentModalOpen(faculty)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Add Department
                    </button>
                  </div>
                </div>
                {/* Departments Section */}
                {faculty.departments && faculty.departments.length > 0 ? (
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <h4 className="text-lg font-semibold mb-2">Departments</h4>
                    <ul className="space-y-2">
                      {faculty.departments.map((department) => (
                        <li
                          key={department._id}
                          className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                        >
                          <span className="text-gray-700">{department.name}</span>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setIsEditDepartmentModalOpen(true);
                                setEditDepartment(department);
                                setEditFaculty(faculty);
                                // setDepartmentName(department.name);
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteDepartment(department);
                                setEditFaculty(faculty);
                                setIsDeleteDepartmentModalOpen(true);
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500">No departments available.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}



      {/* Add Department Modal */}
      {isDepartmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Department to {editFaculty.name}</h2>
            <form onSubmit={handleSubmitDepartment}>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Department Name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDepartmentModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {isEditDepartmentModalOpen &&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Department</h2>
            <form onSubmit={handleEditDepartment}>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Department Name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditDepartmentModalOpen(false);
                    setEditDepartment(null);
                    setDepartmentName("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {isDeleteDepartmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Delete Department</h2>
            <p>Are you sure you want to delete this department?</p>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteDepartmentModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDepartment}
                className="bg-red-500 text-white px-6 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default FacultyManagement;



















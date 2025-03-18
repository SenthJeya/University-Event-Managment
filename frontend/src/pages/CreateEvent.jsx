import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const CreateEvent = () => {
  const [user, setUser] = useState({});
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubPassword, setClubPassword] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    createdBy: "",
    userId: "",
    faculty: "",
    department: "",
    organizedBy: "",
  });

  useEffect(() => {
    // Fetch the current user's details from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setEventData((prevData) => ({
        ...prevData,
        createdBy: storedUser.role || "Unknown User",
        userId: storedUser._id || "Unknown Id",
        faculty: storedUser.faculty || "Unknown Faculty",
        department: storedUser.department || "Unknown Department",
      }));
    }

    // Fetch clubs for students and academic staff
    setIsLoadingClubs(true);
    axios
      .get("http://localhost:5000/club/list")
      .then((response) => {
        setClubs(response.data);
      })
      .catch((error) => {
        toast.error("Failed to fetch clubs. Please try again later.");
        console.error("Error fetching clubs:", error);
      })
      .finally(() => {
        setIsLoadingClubs(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleClubSelection = (club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  const validateClubPassword = (e) => {
    e.preventDefault();

    if (!selectedClub || !selectedClub._id) {
      toast.error("Please select a valid club.");
      return;
    }

    axios
      .get("http://localhost:5000/club/validate", {
        params: {
          clubId: selectedClub._id,
          clubPassword: clubPassword,
        },
      })
      .then((response) => {
        if (response.data.valid) {
          toast.success("Club verified. You can now create an event.");
          setIsModalOpen(false);
          setClubPassword("");
          setIsPasswordVerified(true);
          setEventData((prevData) => ({
            ...prevData,
            organizedBy: selectedClub.name,
          }));
        } else {
          toast.error("Incorrect password. Please try again.");
          setClubPassword("");
        }
      })
      .catch((error) => {
        toast.error("Failed to validate club. Please try again.");
        console.error("Error validating club:", error);
      });
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    const fileArray = Array.from(selectedFiles);

    // Validate file types and size
    const validFileTypes = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const invalidFiles = fileArray.filter(
      (file) => !validFileTypes.includes(file.type) || file.size > maxFileSize
    );

    if (invalidFiles.length > 0) {
      toast.error("Only .docx files under 5MB are allowed!");
      return;
    }

    // Check total number of files
    const totalFiles = fileArray.length + file.length;
    if (totalFiles > 5) {
      toast.error("You can upload a maximum of 5 files.");
      return;
    }

    setFile((prevFiles) => [...prevFiles, ...fileArray]);
  };

  const handleDeleteFile = (fileName) => {
    setFile((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!eventData.name || !eventData.date || !eventData.time || !eventData.venue || !eventData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if ((user.role === "Student" || user.role === "Academic Staff") && !selectedClub) {
      toast.error("Please select a club.");
      return;
    }

    if ((user.role === "Student" || user.role === "Academic Staff") && !isPasswordVerified) {
      toast.error("Please verify the selected club password before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", eventData.name);
    formData.append("date", eventData.date);
    formData.append("time", eventData.time);
    formData.append("venue", eventData.venue);
    formData.append("description", eventData.description);
    formData.append("createdBy", eventData.createdBy);
    formData.append("userId", eventData.userId);
    formData.append("faculty", eventData.faculty);
    formData.append("department", eventData.department);
    formData.append("organizedBy", eventData.organizedBy);

    if (file && file.length > 0) {
      file.forEach((f) => {
        formData.append("files", f);
      });
    }

    axios
      .post("http://localhost:5000/event/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (response.status === 201) {
          toast.success("Event created successfully!");
          setEventData({
            name: "",
            date: "",
            time: "",
            venue: "",
            description: "",
            createdBy: user.role || "Unknown User",
            userId: user._id || "Unknown Id",
            faculty: user.faculty || "Unknown Faculty",
            department: user.department || "Unknown Department",
            organizedBy: "",
          });
          setSelectedClub(null);
          setFile([]);
        } else {
          toast.error("Failed to create event.");
        }
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message || "An error occurred while creating the event.");
        } else {
          toast.error("An error occurred while creating the event.");
        }
        console.error("Error creating event:", error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setClubPassword("");
    if (!isPasswordVerified) {
      setSelectedClub(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create New Event</h2>

          {(user.role === "Student" || user.role === "Academic Staff") && !selectedClub && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Select a Club</h3>
              {isLoadingClubs ? (
                <p>Loading clubs...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {clubs.map((club) => (
                    <button
                      key={club._id}
                      onClick={() => handleClubSelection(club)}
                      className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                    >
                      {club.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {(user.role !== "Student" && user.role !== "Academic Staff" || selectedClub) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event fields */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={eventData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  min={new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={eventData.venue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Upload Supporting Document</label>
                <button
                  type="button"
                  onClick={() => document.getElementById("fileInput").click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 focus:outline-none"
                  aria-label="Choose File"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                {file.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Selected Documents</label>
                    <ul>
                      {file.map((f, index) => (
                        <li key={index} className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">{f.name}</span>
                          <button
                            onClick={() => handleDeleteFile(f.name)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 focus:outline-none"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Created By</label>
                <input
                  type="text"
                  value={eventData.createdBy}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>

              {user.role !== "Vice Chancellor" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Faculty</label>
                    <input
                      type="text"
                      name="faculty"
                      value={eventData.faculty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  {user.role !== "Dean" && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={eventData.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  )}
                </>
              )}

              {(user.role === "Student" || user.role === "Academic Staff") && selectedClub && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Organized By</label>
                  <input
                    type="text"
                    value={selectedClub.name}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-100"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white font-bold rounded ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Event"}
              </button>
            </form>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={handleModalClose}>
          <div className="bg-white p-6 rounded shadow-lg w-1/3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Enter Club Password</h3>
            <input
              type="password"
              value={clubPassword}
              onChange={(e) => setClubPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
              placeholder="Enter password"
            />
            <button
              onClick={validateClubPassword}
              className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
            >
              Validate
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEvent;
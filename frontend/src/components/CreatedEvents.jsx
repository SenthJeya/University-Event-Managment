import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreatedEvents = ({ userRole }) => {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openedFiles, setOpenedFiles] = useState(new Set()); // Track opened files

  // Fetch created events
  useEffect(() => {
    axios
      .get("http://localhost:5000/event/created-events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCreatedEvents(res.data);
        } else {
          console.error("API response is not an array:", res.data);
          setCreatedEvents([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching created events:", err);
        setCreatedEvents([]);
      });
  }, []);

  // Check if Edit and Delete buttons should be enabled (within 6 hours of creation)
  const isEditDeleteEnabled = (eventTimestamp) => {
    const eventTime = new Date(eventTimestamp).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - eventTime;
    const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    return timeDifference <= sixHoursInMs;
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/event/event-delete/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      // Update the local state to remove the deleted event
      setCreatedEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
  
      // Show success toast
      toast.success("Event deleted successfully!");
  
      // Close the delete modal
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  // Handle Edit Event
  const handleEdit = async (updatedEvent) => {
    try {
      // Send the updated event data to the backend
      const response = await axios.put(
        `http://localhost:5000/event/event-edit/${selectedEvent._id}`, // Endpoint to update the event
        {
          name: updatedEvent.name,
          date: updatedEvent.date, // Date (e.g., "2023-10-15")
          time: updatedEvent.time, // Time (e.g., "14:30")
          venue: updatedEvent.venue,
          description: updatedEvent.description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the JWT token for authentication
          },
        }
      );
  
      // Update the event in the local state
      setCreatedEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === selectedEvent._id ? { ...event, ...updatedEvent } : event
        )
      );
  
      // Close the edit modal
      setEditModalOpen(false);
  
      // Show a success message
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    }
  };

  // Helper function to get approval box color based on status
  const getApprovalBoxColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-600 text-white font-bold"; // Orange for pending
      case "approved":
        return "bg-green-600 text-white font-bold"; // Green for approved
      case "rejected":
        return "bg-red-600 text-white font-bold"; // Red for rejected
      default:
        return "bg-gray-100 text-gray-800"; // Default gray
    }
  };

  // Delete Modal
  const DeleteModal = () => {
    if (!deleteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Delete Event</h2>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the event <strong>{selectedEvent?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              onClick={() => handleDelete(selectedEvent._id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Modal
  const EditModal = () => {
    const [name, setName] = useState(selectedEvent?.name || "");
    const [date, setDate] = useState(selectedEvent?.date ? selectedEvent.date.split("T")[0] : ""); // Extract date part
    const [time, setTime] = useState(selectedEvent?.time || "");
    const [venue, setVenue] = useState(selectedEvent?.venue || "");
    const [description, setDescription] = useState(selectedEvent?.description || "");
  
    // Function to calculate the minimum and maximum allowed dates
    const getMinMaxDates = () => {
      const today = new Date();
      const minDate = today.toISOString().split("T")[0]; // Today's date (disable past dates)
      const maxDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split("T")[0]; // 1 week from today
      return { minDate, maxDate };
    };
  
    const { minDate, maxDate } = getMinMaxDates();
  
    if (!editModalOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Edit Event</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={maxDate} // Disable past dates (today is the minimum)
                //max={maxDate} // Disable dates more than 1 week from today
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4} // Adjust the number of rows as needed
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-4">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              onClick={() =>
                handleEdit({
                  name,
                  date, 
                  time,
                  venue,
                  description,
                })
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View Modal
  const ViewModal = () => {
    if (!viewModalOpen || !selectedEvent) return null;
  
    // Extract date and time separately
    const eventDate = new Date(selectedEvent.date).toLocaleDateString(); // Date part
    const eventTime = selectedEvent.time; // Time part directly from the database
  
    // Handle file click (prevent opening in multiple tabs)
    const handleFileClick = (file, index) => {
      if (openedFiles.has(index)) return; // Prevent opening if already opened
      setOpenedFiles((prev) => new Set(prev).add(index)); // Mark as opened
      window.open(file, "_blank"); // Open in new tab
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium text-black">Name:</span> {selectedEvent.name}
            </div>
            <div>
              <span className="font-medium text-black">Date:</span> {eventDate}
            </div>
            <div>
              <span className="font-medium text-black">Time:</span> {eventTime}
            </div>
            <div>
              <span className="font-medium text-black">Venue:</span> {selectedEvent.venue}
            </div>
            <div>
              <span className="font-medium text-black">Description:</span> {selectedEvent.description}
            </div>
            <div>
              <span className="font-medium text-black">Faculty:</span> {selectedEvent.faculty}
            </div>
            <div>
              <span className="font-medium text-black">Department:</span> {selectedEvent.department}
            </div>
  
            {/* Supporting Files Section */}
            {selectedEvent.files && selectedEvent.files.length > 0 && (
              <div>
                <span className="font-medium text-black">Supporting Files:</span>
                <ul className="mt-2 space-y-2">
                  {selectedEvent.files.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default link behavior
                          handleFileClick(file, index); // Handle file click
                        }}
                      >
                        {`File ${index + 1}`}
                      </a>
                      <button
                        onClick={() => {
                          // Trigger file download
                          const link = document.createElement("a");
                          link.href = file;
                          link.download = `File ${index + 1}`; // Set the download filename
                          link.click();
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <h2 className="text-lg font-semibold mb-3">Created Events</h2>
      {createdEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {createdEvents.map((event) => (
            <div key={event._id} className="bg-zinc-100 shadow-sm rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-center">{event.name}</h3>

              {/* Approval Boxes */}
              {["Student", "Academic Staff"].includes(userRole) && (
                <div className="flex space-x-2 mb-4">
                  {/* Head of Department Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.hodApprovalStatus)}`}>
                    <span className="text-sm">Head of Department</span>
                  </div>

                  {/* Dean Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.deanApprovalStatus)}`}>
                    <span className="text-sm">Dean</span>
                  </div>

                  {/* Vice Chancellor Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.vcApprovalStatus)}`}>
                    <span className="text-sm">Vice Chancellor</span>
                  </div>
                </div>
              )}

              {["Head of Department"].includes(userRole) && (
                <div className="flex space-x-2 mb-4">
                  {/* Dean Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.deanApprovalStatus)}`}>
                    <span className="text-sm">Dean</span>
                  </div>

                  {/* Vice Chancellor Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.vcApprovalStatus)}`}>
                    <span className="text-sm">Vice Chancellor</span>
                  </div>
                </div>
              )}

              {["Dean"].includes(userRole) && (
                <div className="flex space-x-2 mb-4">
                  {/* Vice Chancellor Approval Box */}
                  <div className={`flex-1 p-2 rounded-md text-center ${getApprovalBoxColor(event.vcApprovalStatus)}`}>
                    <span className="text-sm">Vice Chancellor</span>
                  </div>
                </div>
              )}

              {/* Buttons (Edit, View, Delete) */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {/* Edit Button */}
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isEditDeleteEnabled(event.createdAt)
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!isEditDeleteEnabled(event.createdAt)}
                    onClick={() => {
                      setSelectedEvent(event);
                      setEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>

                  {/* View Button */}
                  <button
                    className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600"
                    onClick={() => {
                      setSelectedEvent(event);
                      setViewModalOpen(true);
                    }}
                  >
                    View
                  </button>

                  {/* Delete Button */}
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      isEditDeleteEnabled(event.createdAt)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!isEditDeleteEnabled(event.createdAt)}
                    onClick={() => {
                      setSelectedEvent(event);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No created events.</p>
      )}
      <DeleteModal />
      <EditModal />
      <ViewModal />
    </div>
  );
};

export default CreatedEvents;
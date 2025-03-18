import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Reject Modal Component (Moved Outside)
const RejectModal = ({
  rejectModalOpen,
  rejectionMessage,
  setRejectionMessage,
  setRejectModalOpen,
  handleReject,
}) => {
  if (!rejectModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Reject Event</h2>
        <p className="text-gray-700 mb-4">Please provide a reason for rejecting this event.</p>
        <textarea
          value={rejectionMessage}
          onChange={(e) => setRejectionMessage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows="4"
          placeholder="Enter rejection reason..."
        />
        <div className="flex justify-end space-x-4 mt-6">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => setRejectModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
            onClick={handleReject}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingEvents = ({ userRole }) => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");

  // Fetch pending events for Head of Department
  useEffect(() => {
    if (userRole === "Head of Department") {
      axios
        .get(`http://localhost:5000/event/department-events?role=${userRole}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            // Filter events created more than 6 hours ago
            const filteredEvents = res.data.filter((event) => {
              const eventTime = new Date(event.createdAt).getTime();
              const currentTime = new Date().getTime();
              const timeDifference = currentTime - eventTime;
              const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
              return timeDifference >= sixHoursInMs;
            });
            setPendingEvents(filteredEvents);
          } else {
            console.error("API response is not an array:", res.data);
            setPendingEvents([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching pending events:", err);
          setPendingEvents([]);
        });
    }
  }, [userRole]);

  // Fetch pending events for Dean based on faculty
  useEffect(() => {
    if (userRole === "Dean") {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const faculty = storedUser?.faculty; // Get faculty from the logged-in user

      if (faculty) {
        axios
          .get(`http://localhost:5000/event/faculty-events?faculty=${faculty}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((res) => {
            if (Array.isArray(res.data)) {
              // Filter events created more than 6 hours ago
              const filteredEvents = res.data.filter((event) => {
                const eventTime = new Date(event.createdAt).getTime();
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - eventTime;
                const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
                return timeDifference >= sixHoursInMs;
              });
              setPendingEvents(filteredEvents);
            } else {
              console.error("API response is not an array:", res.data);
              setPendingEvents([]);
            }
          })
          .catch((err) => {
            console.error("Error fetching faculty events:", err);
            setPendingEvents([]);
          });
      }
    }
  }, [userRole]);

  // Fetch pending events for Vice Chancellor
  useEffect(() => {
    if (userRole === "Vice Chancellor") {
      axios
        .get(`http://localhost:5000/event/vc-events`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setPendingEvents(res.data);
          } else {
            console.error("API response is not an array:", res.data);
            setPendingEvents([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching Vice Chancellor events:", err);
          setPendingEvents([]);
        });
    }
  }, [userRole]);

  // Handle Approve Event
  const handleApprove = (eventId) => {
    let updateData = {};

    if (userRole === "Head of Department") {
      updateData = { hodApprovalStatus: "approved" };
    } else if (userRole === "Dean") {
      updateData = { deanApprovalStatus: "approved" };
    } else if (userRole === "Vice Chancellor") {
      updateData = { vcApprovalStatus: "approved" };
    }

    axios
      .put(`http://localhost:5000/event/${eventId}/approve`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        setPendingEvents(pendingEvents.filter((event) => event._id !== eventId));
      })
      .catch((err) => console.error("Error approving event:", err));
  };

  // Handle Reject Event
  const handleReject = useCallback(() => {
    if (!selectedEvent) return;

    let updateData = {};

    if (userRole === "Head of Department") {
      updateData = {
        hodApprovalStatus: "rejected",
        hodRejectionMessage: rejectionMessage,
      };
    } else if (userRole === "Dean") {
      updateData = {
        deanApprovalStatus: "rejected",
        deanRejectionMessage: rejectionMessage,
      };
    } else if (userRole === "Vice Chancellor") {
      updateData = {
        vcApprovalStatus: "rejected",
        vcRejectionMessage: rejectionMessage,
      };
    }

    axios
      .put(`http://localhost:5000/event/${selectedEvent._id}/reject`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        setPendingEvents(pendingEvents.filter((event) => event._id !== selectedEvent._id));
        setRejectModalOpen(false);
      })
      .catch((err) => console.error("Error rejecting event:", err));
  }, [selectedEvent, rejectionMessage, userRole, pendingEvents]);

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
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
    <div className="bg-white shadow-md rounded-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Pending Events</h2>
      {pendingEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {pendingEvents.map((event) => (
            <div key={event._id} className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-center">{event.name}</h3>
              <div className="flex justify-between items-center">
                <button
                  className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={() => {
                    setSelectedEvent(event);
                    setViewModalOpen(true); // Open View Modal
                  }}
                >
                  View
                </button>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600"
                    onClick={() => handleApprove(event._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={() => {
                      setSelectedEvent(event);
                      setRejectModalOpen(true);
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No pending events.</p>
      )}
      <RejectModal
        rejectModalOpen={rejectModalOpen}
        rejectionMessage={rejectionMessage}
        setRejectionMessage={setRejectionMessage}
        setRejectModalOpen={setRejectModalOpen}
        handleReject={handleReject}
      />
      <ViewModal />
    </div>
  );
};

export default PendingEvents;
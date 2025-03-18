import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Admin from "../components/Admin";



// Dashboard Component
const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUsername(user.username);
      setRole(user.role); // Assuming the user object contains a "role" field
    } else {
      // Redirect to sign-in page if user is not found in local storage
      navigate("/signin");
    }
  }, [navigate]);

  // Fetch approved events
  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/event/events-approved");
        
        // Sort events by date in descending order (latest first)
        const sortedEvents = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching approved events:", error);
        toast.error("Failed to fetch approved events.");
      }
    };

    fetchApprovedEvents();
  }, []);

  // Handle card click to show event details
  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div>
      <Navbar username={username} onLogout={handleLogout} />
      {/* Conditionally render the Admin component */}
      {role === "Admin" ? (
        <Admin />
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleCardClick(event)}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600">{event.time}</p>
              </div>
            ))}
          </div>

          {/* View Modal */}
          {viewModalOpen && selectedEvent && (
            <ViewModal event={selectedEvent} onClose={() => setViewModalOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
};

const ViewModal = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium text-black">Name:</span> {event.name}
          </div>
          <div>
            <span className="font-medium text-black">Date:</span> {new Date(event.date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium text-black">Time:</span> {event.time}
          </div>
          <div>
            <span className="font-medium text-black">Venue:</span> {event.venue}
          </div>
          <div>
            <span className="font-medium text-black">Description:</span> {event.description}
          </div>
          <div>
            <span className="font-medium text-black">Faculty:</span> {event.faculty}
          </div>
          <div>
            <span className="font-medium text-black">Department:</span> {event.department}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
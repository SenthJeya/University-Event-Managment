import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; 

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false); // State to toggle showing all notifications

  // Fetch created events and generate notifications
  useEffect(() => {
    axios
      .get("http://localhost:5000/event/created-events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          // Generate notifications based on approval/rejection status
          const notificationMessages = res.data
            .map((event) => {
              const messages = [];

              // Check HOD approval status
              if (event.hodApprovalStatus === "approved") {
                messages.push({
                  message: `Event "${event.name}" Approved by Head of Department`,
                  timestamp: event.createdAt, // Use event creation timestamp
                });
              } else if (event.hodApprovalStatus === "rejected") {
                messages.push({
                  message: `Event "${event.name}" Rejected by Head of Department: ${event.hodRejectionMessage}`,
                  timestamp: event.createdAt,
                });
              }

              // Check Dean approval status
              if (event.deanApprovalStatus === "approved") {
                messages.push({
                  message: `Event "${event.name}" Approved by Dean`,
                  timestamp: event.createdAt,
                });
              } else if (event.deanApprovalStatus === "rejected") {
                messages.push({
                  message: `Event "${event.name}" Rejected by Dean: ${event.deanRejectionMessage}`,
                  timestamp: event.createdAt,
                });
              }

              // Check VC approval status
              if (event.vcApprovalStatus === "approved") {
                messages.push({
                  message: `Event "${event.name}" Approved by Vice Chancellor`,
                  timestamp: event.createdAt,
                });
              } else if (event.vcApprovalStatus === "rejected") {
                messages.push({
                  message: `Event "${event.name}" Rejected by Vice Chancellor: ${event.vcRejectionMessage}`,
                  timestamp: event.createdAt,
                });
              }

              return messages;
            })
            .flat(); // Flatten the array of arrays into a single array

          // Sort notifications by timestamp (newest first)
          const sortedNotifications = notificationMessages.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setNotifications(sortedNotifications);
        } else {
          console.error("API response is not an array:", res.data);
          setNotifications([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching created events:", err);
        setNotifications([]);
      });
  }, []);

  // Toggle showing all notifications
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Determine which notifications to display
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 4);

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Notifications</h2>
      {displayedNotifications.length > 0 ? (
        <ul className="space-y-2">
          {displayedNotifications.map((notification, index) => (
            <li
              key={index}
              className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-gray-700"
            >
              {notification.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No new notifications.</p>
      )}

      {/* Show All / Show Less Button */}
      {notifications.length > 4 && (
        <button
          onClick={toggleShowAll}
          className="flex items-center justify-center w-full mt-3 text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          {showAll ? (
            <>
              <span>Show Less</span>
              <FaChevronUp className="ml-2" />
            </>
          ) : (
            <>
              <span>Show All</span>
              <FaChevronDown className="ml-2" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Notifications;
import React from "react";
import Navbar from "../components/Navbar";
import Notifications from "../components/Notifications";
import PendingEvents from "../components/PendingEvents";
import CreatedEvents from "../components/CreatedEvents";

const ManageEvent = () => {
  const userRole = JSON.parse(localStorage.getItem("user"))?.role || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Notifications />
        <PendingEvents userRole={userRole} />
        <CreatedEvents userRole={userRole} />
      </div>
    </div>
  );
};

export default ManageEvent;
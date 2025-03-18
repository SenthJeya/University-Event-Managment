import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

const Admin = () => {
    return (
      <div className="min-h-screen bg-gray-100">

      {/* Dashboard Content */}
      <div className="container mx-auto p-8">
        {/* <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Admin Dashboard</h1> */}
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Manage Users and Faculties</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Dashboard Section */}
            <Link to="/signup">
              <div className="bg-blue-500 hover:bg-sky-700 text-white p-4 rounded-xl">
                <h3 className="text-xl font-bold">Manage Users</h3>
                <p className="mt-2">Manage All User Accounts.</p>
              </div>
            </Link>
            
            <Link to="/admin/faculty-management">
              <div className="bg-green-500 hover:bg-green-700 text-white p-4 rounded-xl">
                <h3 className="text-xl font-bold">Faculty Management</h3>
                <p className="mt-2">Manage All Faculties And Departments.</p>
              </div>
            </Link>

            <Link to="/admin/club-management">
              <div className="bg-blue-500 hover:bg-blue-700 text-white p-4 rounded-xl">
                <h3 className="text-xl font-bold">Club And Union Management</h3>
                <p className="mt-2">Manage All Clubs And Unions.</p>
              </div>
            </Link>
            
            <Link to="/admin/reports">
              <div className="bg-yellow-500 hover:bg-yellow-700 text-white p-4 rounded-xl">
                <h3 className="text-xl font-bold">Reports</h3>
                <p className="mt-2">View system reports and activities.</p>
              </div>
            </Link>   
          </div>
        </div>
      </div>
    </div>
    );
};

export default Admin;
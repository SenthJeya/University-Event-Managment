import React, { useState, useEffect } from "react";
import axios from "axios";

const ClubUnionManagement = () => {
    const [clubs, setClubs] = useState([]); // Initialize as an empty array
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentClub, setCurrentClub] = useState(null);
    const [formValues, setFormValues] = useState({ name: "", password: "" });
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
    const [clubToDelete, setClubToDelete] = useState(null); // Store the club to delete

    // Fetch clubs from the database (backend API)
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await axios.get("http://localhost:5000/club/list");
                if (Array.isArray(response.data)) {
                    setClubs(response.data); // Set clubs as an array
                } else if (response.data.message) {
                    console.log(response.data.message); // Log the message if no clubs are found
                    setClubs([]); // Set empty array if no clubs are found
                }
            } catch (error) {
                console.error("Failed to fetch clubs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    }, []);

    const handleAddClub = () => {
        setIsEditMode(false);
        setCurrentClub(null);
        setFormValues({ name: "", password: "" });
        setIsModalOpen(true);
    };

    const handleEditClub = (clubId) => {
        const club = clubs.find((club) => club._id === clubId); // Find club by _id
        setIsEditMode(true);
        setCurrentClub(club);
        setFormValues(club);
        setIsModalOpen(true);
    };

    const handleDeleteClub = (clubId) => {
        setClubToDelete(clubId); // Set the club to delete
        setIsDeleteModalOpen(true); // Open the confirmation modal
    };

    const confirmDeleteClub = async () => {
        try {
            await axios.delete(`http://localhost:5000/club/delete/${clubToDelete}`);
            setClubs(clubs.filter((club) => club._id !== clubToDelete)); // Remove the club from the array
            setIsDeleteModalOpen(false); // Close the modal after successful deletion
        } catch (error) {
            console.error("Failed to delete club", error);
        }
    };

    const cancelDeleteClub = () => {
        setIsDeleteModalOpen(false); // Close the modal if user cancels
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode && currentClub) {
                await axios.put(`http://localhost:5000/club/edit/${currentClub._id}`, formValues); // Update the club by its _id
            } else {
                await axios.post("http://localhost:5000/club/createclub", formValues); // Create a new club
            }
            setIsModalOpen(false);
            setFormValues({ name: "", password: "" });
            // Re-fetch clubs to update the list
            const response = await axios.get("http://localhost:5000/club/list");
            setClubs(response.data);
        } catch (error) {
            console.error("Failed to save club", error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center">
                    <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 mx-auto"></div>
                    <p className="text-white mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6">Manage Clubs</h1>
            <button
                onClick={handleAddClub}
                className="bg-blue-500 text-white px-6 py-3 rounded mb-6 hover:bg-blue-600 transition-all"
            >
                Add Club
            </button>

            {clubs.length === 0 ? (
                <p className="text-lg text-gray-600">No clubs found. Please add a club.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {clubs.map((club) => {
                        return (
                            <div key={club._id} className="bg-white border border-gray-300 rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold mb-4">{club.name}</h2>
                                <div className="flex flex-row space-x-4">
                                    <button
                                        onClick={() => handleEditClub(club._id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClub(club._id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-6">{isEditMode ? "Edit Club" : "Add Club"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Club Name</label>
                                <input
                                    type="text"
                                    value={formValues.name}
                                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                    className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={formValues.password}
                                    onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                                    placeholder={isEditMode ? "Enter new password" : "Enter password"}
                                    className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all"
                                >
                                    {isEditMode ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Are you sure you want to delete this club?</h2>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelDeleteClub}
                                className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteClub}
                                className="px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-all"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubUnionManagement;

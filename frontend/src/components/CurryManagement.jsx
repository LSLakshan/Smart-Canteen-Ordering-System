import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const CurryManagement = () => {
  const [curries, setCurries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCurry, setEditingCurry] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    available: true,
  });

  useEffect(() => {
    fetchCurries();
  }, []);

  const fetchCurries = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:5000/api/curries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch curries");
      }

      const data = await response.json();
      setCurries(data.curries || []); // Fallback to empty array
    } catch (error) {
      setError("Failed to fetch curries");
      setCurries([]); // Set to empty array on error
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const url = editingCurry
        ? `http://localhost:5000/api/curries/${editingCurry._id}`
        : "http://localhost:5000/api/curries";

      const method = editingCurry ? "PUT" : "POST";

      const submissionData = {
        name: formData.name.trim(),
        available: formData.available,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save curry");
      }

      const result = await response.json();
      
      setSuccessMessage(
        editingCurry
          ? "Curry updated successfully!"
          : "Curry created successfully!"
      );

      // Reset form and close modal
      setFormData({
        name: "",
        available: true,
      });
      setEditingCurry(null);
      setShowModal(false);

      // Refresh curries list
      fetchCurries();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (curry) => {
    setEditingCurry(curry);
    setFormData({
      name: curry.name,
      available: curry.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (curryId) => {
    if (!window.confirm("Are you sure you want to delete this curry?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/curries/${curryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete curry");
      }

      setSuccessMessage("Curry deleted successfully!");
      fetchCurries();
    } catch (error) {
      setError("Failed to delete curry");
    }
  };

  const toggleAvailability = async (curry) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/curries/${curry._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: curry.name,
            available: !curry.available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update curry availability");
      }

      fetchCurries();
    } catch (error) {
      setError("Failed to update curry availability");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      available: true,
    });
    setEditingCurry(null);
    setShowModal(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Curry Management
        </h1>
        <p className="text-gray-600">
          Manage curry items for your canteen menu
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Add Curry Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Curry
        </button>
      </div>

      {/* Curries Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curry Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(curries) && curries.map((curry) => {
                return (
                  <tr key={curry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {curry.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {curry.customId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(curry)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          curry.available
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {curry.available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(curry)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(curry._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!Array.isArray(curries) || curries.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No curries found</div>
              <p className="text-gray-400 mt-2">
                Add your first curry to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCurry ? "Edit Curry" : "Add New Curry"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curry Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Chicken Curry"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="available"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Available for ordering
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    {editingCurry ? "Update Curry" : "Add Curry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurryManagement;

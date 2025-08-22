import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { API_BASE_URL } from "../config";

const DailyMealCustomizer = ({ mealType, mealTitle, mealIcon, onClose, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items?available=true`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoodItems(data);
      } else {
        enqueueSnackbar("Failed to load food items", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      enqueueSnackbar("Error loading food items", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === foodItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(foodItems.map(item => item._id));
    }
  };

  const handleSave = () => {
    setSaving(true);
    onSave(mealType, selectedItems);
    setSaving(false);
  };

  const handleCancel = () => {
    setSelectedItems([]);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading food items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{mealIcon}</span>
              <div>
                <h2 className="text-xl font-bold">Customize {mealTitle}</h2>
                <p className="text-indigo-100 text-sm">Select food items for today's {mealType}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selection Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedItems.length} of {foodItems.length} items selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                {selectedItems.length === foodItems.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Food Items List */}
          <div className="max-h-96 overflow-y-auto">
            {foodItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No food items available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {foodItems.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedItems.includes(item._id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleItemToggle(item._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleItemToggle(item._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <span className="text-sm font-semibold text-indigo-600">
                            Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 && (
              <span>
                Total selected: {selectedItems.length} items
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMealCustomizer;

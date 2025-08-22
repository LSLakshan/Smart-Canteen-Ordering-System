import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { API_BASE_URL } from "../config";

const EnhancedDailyMealCustomizer = ({ 
  mealType, 
  mealTitle, 
  mealIcon, 
  currentMealData = { foodItems: [], curries: [] },
  onClose, 
  onSave 
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [foodItems, setFoodItems] = useState([]);
  const [curries, setCurries] = useState([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState(currentMealData.foodItems || []);
  const [selectedCurries, setSelectedCurries] = useState(currentMealData.curries || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("foodItems");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update selections when currentMealData changes
    setSelectedFoodItems(currentMealData.foodItems || []);
    setSelectedCurries(currentMealData.curries || []);
  }, [currentMealData]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch food items and curries in parallel
      const [foodResponse, curryResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/food-items?available=true`, {
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/curries?available=true`, {
          headers: { "Authorization": `Bearer ${token}` },
        })
      ]);
      
      if (foodResponse.ok) {
        const foodData = await foodResponse.json();
        setFoodItems(foodData);
      } else {
        enqueueSnackbar("Failed to load food items", { variant: "error" });
      }

      if (curryResponse.ok) {
        const curryData = await curryResponse.json();
        console.log('Curry data received:', curryData);
        
        // Handle different response formats
        if (Array.isArray(curryData)) {
          setCurries(curryData);
        } else if (curryData && Array.isArray(curryData.curries)) {
          setCurries(curryData.curries);
        } else {
          console.warn('Invalid curry data format:', curryData);
          setCurries([]);
        }
      } else {
        console.error("Failed to load curries");
        setCurries([]);
        enqueueSnackbar("Failed to load curries", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      enqueueSnackbar("Error loading menu data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFoodItemToggle = (itemId) => {
    setSelectedFoodItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleCurryToggle = (curryId) => {
    setSelectedCurries(prev => {
      if (prev.includes(curryId)) {
        return prev.filter(id => id !== curryId);
      } else {
        return [...prev, curryId];
      }
    });
  };

  const handleSelectAllFoodItems = () => {
    if (selectedFoodItems.length === foodItems.length) {
      setSelectedFoodItems([]);
    } else {
      setSelectedFoodItems(foodItems.map(item => item._id));
    }
  };

  const handleSelectAllCurries = () => {
    if (selectedCurries.length === curries.length) {
      setSelectedCurries([]);
    } else {
      setSelectedCurries(curries.map(curry => curry._id));
    }
  };

  const handleSave = async () => {
    if (selectedFoodItems.length === 0 && selectedCurries.length === 0) {
      enqueueSnackbar("Please select at least one food item or curry", { variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const mealData = {
        [mealType]: {
          foodItems: selectedFoodItems,
          curries: selectedCurries
        }
      };

      await onSave(mealData);
      enqueueSnackbar(`${mealTitle} menu updated successfully!`, { variant: "success" });
      onClose();
    } catch (error) {
      console.error("Error saving meal:", error);
      enqueueSnackbar("Error saving meal configuration", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading menu items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-10">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{mealIcon}</span>
              <h3 className="text-2xl font-bold text-gray-900">
                Customize {mealTitle} Menu
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Section Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveSection("foodItems")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === "foodItems"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🍽️ Food Items ({selectedFoodItems.length} selected)
                </button>
                <button
                  onClick={() => setActiveSection("curries")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === "curries"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🍛 Curries ({selectedCurries.length} selected)
                </button>
              </nav>
            </div>
          </div>

          {/* Food Items Section */}
          {activeSection === "foodItems" && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Select Food Items for {mealTitle}
                </h4>
                <button
                  onClick={handleSelectAllFoodItems}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  {selectedFoodItems.length === foodItems.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                {foodItems.map((item) => (
                  <div
                    key={item._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedFoodItems.includes(item._id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleFoodItemToggle(item._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          LKR {item.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {item.customId}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedFoodItems.includes(item._id)}
                        onChange={() => handleFoodItemToggle(item._id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {foodItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No food items available
                </div>
              )}
            </div>
          )}

          {/* Curries Section */}
          {activeSection === "curries" && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Select Curries for {mealTitle}
                </h4>
                <button
                  onClick={handleSelectAllCurries}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  {selectedCurries.length === curries.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                {curries.map((curry) => (
                  <div
                    key={curry._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCurries.includes(curry._id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleCurryToggle(curry._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🍛</span>
                          <h5 className="font-medium text-gray-900">{curry.name}</h5>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {curry.customId}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCurries.includes(curry._id)}
                        onChange={() => handleCurryToggle(curry._id)}
                        className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {curries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No curries available
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-gray-900 mb-2">Selection Summary</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Food Items:</span>
                <span className="ml-2 text-indigo-600">{selectedFoodItems.length} selected</span>
              </div>
              <div>
                <span className="font-medium">Curries:</span>
                <span className="ml-2 text-orange-600">{selectedCurries.length} selected</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (selectedFoodItems.length === 0 && selectedCurries.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                `Save ${mealTitle} Menu`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDailyMealCustomizer;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { isAuthenticated, isAdmin } from "../utils/auth";
import { API_BASE_URL } from "../config";

const MenuManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // States for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for adding new food item
  const [newFood, setNewFood] = useState({
    name: "",
    price: ""
  });
  
  // States for daily meal settings
  const [dailyMeals, setDailyMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: []
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("manage");

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }
    
    // Load existing daily meals (in real app, this would come from API)
    const savedMeals = localStorage.getItem("dailyMeals");
    if (savedMeals) {
      setDailyMeals(JSON.parse(savedMeals));
    }
    
    // Load food items from API
    fetchFoodItems();
  }, [navigate]);

  // Fetch food items from backend
  const fetchFoodItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
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

  // Generate unique ID for new food items (for local use only)
  const generateFoodId = () => {
    return Math.max(...menuItems.map(item => item._id || item.id), 0) + 1;
  };

  // Handle adding new food item
  const handleAddFood = async (e) => {
    e.preventDefault();
    
    if (!newFood.name.trim() || !newFood.price || parseFloat(newFood.price) <= 0) {
      enqueueSnackbar("Please provide valid food name and price", { variant: "error" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: newFood.name.trim(),
          price: parseFloat(newFood.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMenuItems([data.foodItem, ...menuItems]);
        setNewFood({ name: "", price: "" });
        enqueueSnackbar(`${data.foodItem.name} added successfully!`, { variant: "success" });
      } else {
        enqueueSnackbar(data.message || "Failed to add food item", { variant: "error" });
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      enqueueSnackbar("Error adding food item", { variant: "error" });
    }
  };

  // Handle deleting food item
  const handleDeleteFood = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setMenuItems(menuItems.filter(item => (item._id || item.id) !== id));
        
        // Remove from daily meals if assigned
        const updatedMeals = { ...dailyMeals };
        Object.keys(updatedMeals).forEach(meal => {
          updatedMeals[meal] = updatedMeals[meal].filter(itemId => itemId !== id);
        });
        setDailyMeals(updatedMeals);
        localStorage.setItem("dailyMeals", JSON.stringify(updatedMeals));
        
        enqueueSnackbar("Food item deleted successfully", { variant: "success" });
      } else {
        const data = await response.json();
        enqueueSnackbar(data.message || "Failed to delete food item", { variant: "error" });
      }
    } catch (error) {
      console.error("Error deleting food item:", error);
      enqueueSnackbar("Error deleting food item", { variant: "error" });
    }
  };

  // Handle toggling availability
  const handleToggleAvailability = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/${id}/toggle-availability`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(menuItems.map(item => 
          (item._id || item.id) === id ? data.foodItem : item
        ));
        enqueueSnackbar(data.message, { variant: "info" });
      } else {
        const data = await response.json();
        enqueueSnackbar(data.message || "Failed to update availability", { variant: "error" });
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      enqueueSnackbar("Error updating availability", { variant: "error" });
    }
  };

  // Handle adding item to daily meal
  const handleAddToDailyMeal = (mealType, foodId) => {
    const updatedMeals = { ...dailyMeals };
    if (!updatedMeals[mealType].includes(foodId)) {
      updatedMeals[mealType] = [...updatedMeals[mealType], foodId];
      setDailyMeals(updatedMeals);
      localStorage.setItem("dailyMeals", JSON.stringify(updatedMeals));
      
      const foodName = menuItems.find(item => (item._id || item.id) === foodId)?.name;
      enqueueSnackbar(`${foodName} added to today's ${mealType}`, { variant: "success" });
    } else {
      enqueueSnackbar("Item already in this meal", { variant: "warning" });
    }
  };

  // Handle removing item from daily meal
  const handleRemoveFromDailyMeal = (mealType, foodId) => {
    const updatedMeals = { ...dailyMeals };
    updatedMeals[mealType] = updatedMeals[mealType].filter(id => id !== foodId);
    setDailyMeals(updatedMeals);
    localStorage.setItem("dailyMeals", JSON.stringify(updatedMeals));
    
    const foodName = menuItems.find(item => (item._id || item.id) === foodId)?.name;
    enqueueSnackbar(`${foodName} removed from today's ${mealType}`, { variant: "info" });
  };

  // Get food item by ID
  const getFoodById = (id) => menuItems.find(item => (item._id || item.id) === id);

  const handleGoBack = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-indigo-600">Menu Management</h1>
            </div>
            <div className="flex items-center">
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("manage")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "manage"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Manage Menu Items
              </button>
              <button
                onClick={() => setActiveTab("daily")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "daily"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Daily Meal Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Manage Menu Items Tab */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            {/* Add New Food Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Food Item</h3>
              <form onSubmit={handleAddFood} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter food name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Add Food Item
                  </button>
                </div>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Menu Items</h3>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Loading menu items...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Price (LKR)
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <p className="text-sm font-medium">No food items found</p>
                              <p className="text-xs text-gray-400">Add your first item using the form above</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        menuItems.map((item) => (
                          <tr key={item._id || item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                              #{item._id ? item._id.slice(-6) : item.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-gray-900">
                                Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                item.available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleToggleAvailability(item._id || item.id)}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    item.available
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {item.available ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => handleDeleteFood(item._id || item.id)}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily Meal Settings Tab */}
        {activeTab === "daily" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Breakfast */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">🌅 Today's Breakfast</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {dailyMeals.breakfast.length} items
                  </span>
                </div>
                
                {/* Current breakfast items */}
                <div className="space-y-2 mb-4">
                  {dailyMeals.breakfast.map(foodId => {
                    const food = getFoodById(foodId);
                    return food ? (
                      <div key={foodId} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{food.name} - Rs. {Number(food.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        <button
                          onClick={() => handleRemoveFromDailyMeal('breakfast', foodId)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                  {dailyMeals.breakfast.length === 0 && (
                    <p className="text-gray-500 text-sm">No items set for breakfast</p>
                  )}
                </div>
                
                {/* Add items */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add items:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {menuItems.filter(item => item.available && !dailyMeals.breakfast.includes(item._id || item.id)).map(item => (
                      <button
                        key={item._id || item.id}
                        onClick={() => handleAddToDailyMeal('breakfast', item._id || item.id)}
                        className="w-full text-left text-xs p-2 hover:bg-gray-100 rounded"
                      >
                        {item.name} - Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">☀️ Today's Lunch</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {dailyMeals.lunch.length} items
                  </span>
                </div>
                
                {/* Current lunch items */}
                <div className="space-y-2 mb-4">
                  {dailyMeals.lunch.map(foodId => {
                    const food = getFoodById(foodId);
                    return food ? (
                      <div key={foodId} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{food.name} - Rs. {Number(food.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        <button
                          onClick={() => handleRemoveFromDailyMeal('lunch', foodId)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                  {dailyMeals.lunch.length === 0 && (
                    <p className="text-gray-500 text-sm">No items set for lunch</p>
                  )}
                </div>
                
                {/* Add items */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add items:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {menuItems.filter(item => item.available && !dailyMeals.lunch.includes(item._id || item.id)).map(item => (
                      <button
                        key={item._id || item.id}
                        onClick={() => handleAddToDailyMeal('lunch', item._id || item.id)}
                        className="w-full text-left text-xs p-2 hover:bg-gray-100 rounded"
                      >
                        {item.name} - Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">🌙 Today's Dinner</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {dailyMeals.dinner.length} items
                  </span>
                </div>
                
                {/* Current dinner items */}
                <div className="space-y-2 mb-4">
                  {dailyMeals.dinner.map(foodId => {
                    const food = getFoodById(foodId);
                    return food ? (
                      <div key={foodId} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{food.name} - Rs. {Number(food.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        <button
                          onClick={() => handleRemoveFromDailyMeal('dinner', foodId)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                  {dailyMeals.dinner.length === 0 && (
                    <p className="text-gray-500 text-sm">No items set for dinner</p>
                  )}
                </div>
                
                {/* Add items */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add items:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {menuItems.filter(item => item.available && !dailyMeals.dinner.includes(item._id || item.id)).map(item => (
                      <button
                        key={item._id || item.id}
                        onClick={() => handleAddToDailyMeal('dinner', item._id || item.id)}
                        className="w-full text-left text-xs p-2 hover:bg-gray-100 rounded"
                      >
                        {item.name} - Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;

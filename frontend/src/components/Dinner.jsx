import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Dinner = () => {
  const navigate = useNavigate();
  const [dinnerItems, setDinnerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");

  useEffect(() => {
    const fetchDinner = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/daily-meals`);
        const data = await response.json();
        if (response.ok && data.dinner) {
          setDinnerItems(data.dinner);
        } else {
          setDinnerItems([]);
        }
      } catch (err) {
        setError("Failed to fetch dinner items.");
      } finally {
        setLoading(false);
      }
    };
    fetchDinner();
  }, []);

  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  const handleConfirmOrder = () => {
    setShowQuantityModal(false);
    setShowTimeSlotModal(true);
  };

  const handleTimeSlotSelection = () => {
    if (!selectedTimeSlot) {
      alert("Please select a time slot!");
      return;
    }

    // Generate unique parcel token
    const token = "#" + Math.floor(Math.random() * 90000 + 10000).toString();
    setGeneratedToken(token);

    // Save order to backend
    saveOrderToBackend(token);
  };

  const saveOrderToBackend = async (token) => {
    try {
      const orderData = {
        items: [
          {
            foodItemId: selectedItem._id,
            name: selectedItem.name,
            price: selectedItem.price,
            quantity: quantity,
            mealType: "dinner",
          },
        ],
        timeSlot: selectedTimeSlot,
        totalAmount: selectedItem.price * quantity,
        token: token,
        notes: `Dinner order - ${selectedItem.name}`,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Add to cart for display purposes
        const existingItem = cart.find(
          (cartItem) => cartItem._id === selectedItem._id
        );
        if (existingItem) {
          setCart(
            cart.map((cartItem) =>
              cartItem._id === selectedItem._id
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + quantity,
                    timeSlot: selectedTimeSlot,
                    token: token,
                  }
                : cartItem
            )
          );
        } else {
          setCart([
            ...cart,
            {
              ...selectedItem,
              quantity,
              timeSlot: selectedTimeSlot,
              token: token,
            },
          ]);
        }

        setShowTimeSlotModal(false);
        setShowTokenModal(true);
      } else {
        const errorData = await response.json();
        alert(`Order failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Order save error:", error);
      alert("Failed to save order. Please try again.");
    }
  };

  const handleTokenGenerated = () => {
    setShowTokenModal(false);
    setSelectedItem(null);
    setSelectedTimeSlot("");
    setQuantity(1);
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    alert(`Order placed successfully! Total: Rs. ${total}`);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate("/home")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              <span>Home</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-purple-800">Dinner Menu</h1>
        </div>

        {loading ? (
          <p className="text-lg text-gray-700 text-center">
            Loading dinner items...
          </p>
        ) : error ? (
          <p className="text-lg text-red-600 text-center">{error}</p>
        ) : dinnerItems.length === 0 ? (
          <p className="text-lg text-gray-700 text-center">
            No dinner items available.
          </p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Menu Items */}
            <div className="flex-1">
              <div className="grid gap-4 md:grid-cols-2">
                {dinnerItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {item.name}
                        </h3>
                        <p className="text-purple-700 font-bold text-xl">
                          Rs. {item.price}
                        </p>
                      </div>
                      <div className="ml-4">
                        {item.available ? (
                          <span className="text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded">
                            Available
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm font-bold bg-red-100 px-2 py-1 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                    {item.available && (
                      <button
                        onClick={() => handleOrderClick(item)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Cart
                </h2>
                {cart.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty</p>
                ) : (
                  <div>
                    <div className="space-y-3 mb-4">
                      {cart.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-gray-600 text-sm">
                              Rs. {item.price} x {item.quantity}
                            </p>
                            {item.timeSlot && (
                              <p className="text-blue-600 text-xs">
                                Time: {item.timeSlot}
                              </p>
                            )}
                            {item.token && (
                              <p className="text-green-600 text-xs font-bold">
                                Token: {item.token}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold">
                            Rs. {item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 mb-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>
                          Rs.{" "}
                          {cart.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition"
                    >
                      Place Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selection Modal */}
        {showQuantityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">
                Select Number of Parcels
              </h3>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Item: {selectedItem?.name}</p>
                <p className="text-gray-700 mb-4">
                  Price: Rs. {selectedItem?.price} per parcel
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Parcels:
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    +
                  </button>
                </div>
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">
                    Rs. {selectedItem?.price * quantity}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQuantityModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Select Time Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Slot Selection Modal */}
        {showTimeSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Select Time Slot</h3>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Item: {selectedItem?.name}</p>
                <p className="text-gray-700 mb-2">
                  Quantity: {quantity} parcels
                </p>
                <p className="text-gray-700 mb-4">
                  Total: Rs. {selectedItem?.price * quantity}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Time Slots:
                </label>
                <div className="space-y-2">
                  {["6:30 PM", "6:45 PM", "7:00 PM", "7:15 PM", "7:45 PM"].map(
                    (timeSlot) => (
                      <label
                        key={timeSlot}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={timeSlot}
                          checked={selectedTimeSlot === timeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">{timeSlot}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowTimeSlotModal(false);
                    setShowQuantityModal(true);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={handleTimeSlotSelection}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Generate Token
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Token Generated Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Order Confirmed!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your parcel token has been generated
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      Item: {selectedItem?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {quantity} parcels
                    </p>
                    <p className="text-sm text-gray-600">
                      Time Slot: {selectedTimeSlot}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: Rs. {selectedItem?.price * quantity}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700">
                      Your Token Number:
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {generatedToken}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <p>
                    Please save this token number. You'll need it to collect
                    your order.
                  </p>
                </div>

                <button
                  onClick={handleTokenGenerated}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Thank you for Your Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dinner;

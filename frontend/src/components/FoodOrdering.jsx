import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const FoodOrdering = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [userInfo, setUserInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [menuItems] = useState([
    {
      id: 1,
      name: "Chicken Burger",
      price: 1299.00,
      description: "Juicy grilled chicken with fresh lettuce and tomato",
      image: "🍔",
      category: "Burgers"
    },
    {
      id: 2,
      name: "Pizza Margherita",
      price: 1599.00,
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      image: "🍕",
      category: "Pizza"
    },
    {
      id: 3,
      name: "Caesar Salad",
      price: 999.00,
      description: "Fresh romaine lettuce with Caesar dressing and croutons",
      image: "🥗",
      category: "Salads"
    },
    {
      id: 4,
      name: "Grilled Sandwich",
      price: 899.00,
      description: "Toasted sandwich with cheese and vegetables",
      image: "🥪",
      category: "Sandwiches"
    },
    {
      id: 5,
      name: "Pasta Carbonara",
      price: 1399.00,
      description: "Creamy pasta with bacon and parmesan cheese",
      image: "🍝",
      category: "Pasta"
    },
    {
      id: 6,
      name: "Fresh Orange Juice",
      price: 499.00,
      description: "Freshly squeezed orange juice",
      image: "🧃",
      category: "Beverages"
    }
  ]);

  useEffect(() => {
    // Get user info from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(tokenData);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    enqueueSnackbar(`${item.name} added to cart!`, { variant: "success" });
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    enqueueSnackbar("Item removed from cart", { variant: "info" });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      enqueueSnackbar("Your cart is empty!", { variant: "warning" });
      return;
    }
    enqueueSnackbar("Order placed successfully!", { variant: "success" });
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    enqueueSnackbar("Logged out successfully", { variant: "success" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">Smart Canteen</h1>
              </div>
              <div className="ml-6">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Food Ordering
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">Welcome back!</span>
                <div className="relative">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                    Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">{item.image}</div>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600">
                          Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Cart</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-gray-600">Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">
                          Total: Rs. {Number(getTotalPrice()).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrdering;

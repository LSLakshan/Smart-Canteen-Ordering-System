import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Smart Canteen
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/breakfast")}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Breakfast
              </button>
              <button
                onClick={() => navigate("/lunch")}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Lunch
              </button>
              <button
                onClick={() => navigate("/dinner")}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dinner
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg py-12 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Smart Canteen!
              </h2>
              <p className="text-gray-600">
                Please select a meal to continue: Breakfast, Lunch, or Dinner.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <div
                className="bg-indigo-100 hover:bg-indigo-200 transition cursor-pointer rounded-xl shadow-md px-8 py-6 flex flex-col items-center w-64"
                onClick={() => navigate("/breakfast")}
              >
                <span className="text-3xl mb-2">🍳</span>
                <span className="text-xl font-semibold text-indigo-700 mb-2">
                  Breakfast
                </span>
                <span className="text-gray-600">
                  Start your day with a healthy breakfast!
                </span>
              </div>
              <div
                className="bg-green-100 hover:bg-green-200 transition cursor-pointer rounded-xl shadow-md px-8 py-6 flex flex-col items-center w-64"
                onClick={() => navigate("/lunch")}
              >
                <span className="text-3xl mb-2">🍛</span>
                <span className="text-xl font-semibold text-green-700 mb-2">
                  Lunch
                </span>
                <span className="text-gray-600">
                  Enjoy a delicious lunch menu!
                </span>
              </div>
              <div
                className="bg-purple-100 hover:bg-purple-200 transition cursor-pointer rounded-xl shadow-md px-8 py-6 flex flex-col items-center w-64"
                onClick={() => navigate("/dinner")}
              >
                <span className="text-3xl mb-2">🍽️</span>
                <span className="text-xl font-semibold text-purple-700 mb-2">
                  Dinner
                </span>
                <span className="text-gray-600">
                  Relax with a tasty dinner!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

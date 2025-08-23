import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import FoodOrdering from "./components/FoodOrdering";
import MenuManagement from "./components/MenuManagement";
import { isAuthenticated, getUserRole } from "./utils/auth";
import "./App.css";

// Protected Route component with role-based redirection
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required and user doesn't have it, redirect based on their actual role
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "admin") {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/home" />;
    }
  }

  return children;
};

// Route component that redirects based on user role
const RoleBasedRedirect = () => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" />;
  } else {
    return <Navigate to="/home" />;
  }
};

import Home from "./components/Home";
import Breakfast from "./components/Breakfast";
import Lunch from "./components/Lunch";
import Dinner from "./components/Dinner";
import OrdersManagement from "./components/OrdersManagement";

function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={4000}
    >
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <MenuManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <OrdersManagement />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute requiredRole="user">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/breakfast"
              element={
                <ProtectedRoute requiredRole="user">
                  <Breakfast />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lunch"
              element={
                <ProtectedRoute requiredRole="user">
                  <Lunch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dinner"
              element={
                <ProtectedRoute requiredRole="user">
                  <Dinner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-ordering"
              element={
                <ProtectedRoute requiredRole="user">
                  <FoodOrdering />
                </ProtectedRoute>
              }
            />

            {/* Fallback for old dashboard route */}
            <Route
              path="/old-dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </SnackbarProvider>
  );
}

export default App;

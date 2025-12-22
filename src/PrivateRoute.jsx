import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

// Function to validate token with the backend
const validateToken = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return { isValid: false, user: null };
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/token/validate/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Store the validated user in localStorage if needed
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return { isValid: true, user: response.data.user };
  } catch (error) {
    console.error("Token validation failed:", error);

    // Clear all stored values on failure
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenantSchema");
    localStorage.removeItem("user");

    return { isValid: false, user: null };
  }
};

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const result = await validateToken();

      // Ensure both token is valid AND userId exists
      if (result.isValid && result.user?.id) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  // Show loading state while validating token
  if (isAuthenticated === null) {
    return (
      <div className="Alll_OOo_LODer">
        <div className="loader"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;

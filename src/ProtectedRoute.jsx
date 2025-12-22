import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, accessKey }) => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  useEffect(() => {
    if (!user?.profile?.[accessKey]) {
      navigate("/staff", { replace: true });
    }
  }, [user, accessKey, navigate]);

  if (!user?.profile?.[accessKey]) {
    return null;
  }

  return children;
};

export default ProtectedRoute;

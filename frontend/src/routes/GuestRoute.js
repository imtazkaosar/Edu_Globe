import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const user = useSelector((state) => state?.user?.user);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default GuestRoute;

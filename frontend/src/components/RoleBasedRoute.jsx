import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Get user data from localStorage

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to a forbidden page or default route if role is not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // Render children if the role is valid
};

export default RoleBasedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/login/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const user = getCurrentUser();

  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin',
      waiter: '/mesero',     
      kitchen: '/cocina',
      caja: '/caja',
    };
    
    const redirectTo = dashboardRoutes[user.role] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
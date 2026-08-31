import React from "react";
import { Navigate } from "react-router-dom";
import { useDemoAuth, type DemoUserRole } from "@/contexts/DemoAuthContext";

interface ProtectedRouteProps {
  allowedRole: DemoUserRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRole,
  children,
}) => {
  const { user } = useDemoAuth();

  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

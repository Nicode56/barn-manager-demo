import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDemoAuth } from "@/contexts/DemoAuthContext";

export const DemoRoleRouter: React.FC = () => {
  const { role } = useParams();
  const { loginAs } = useDemoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;

    // Convert URL role to valid type
    const validRoles = ["manager", "staff", "client"] as const;

    if (validRoles.includes(role as any)) {
      loginAs(role as any);

      // Redirect to the correct dashboard
      navigate(`/demo/${role}/dashboard`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [role, loginAs, navigate]);

  return <div className="p-8">Loading demo…</div>;
};

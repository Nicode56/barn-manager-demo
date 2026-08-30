import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDemoAuth, type DemoUserRole } from "@/contexts/DemoAuthContext";

export const DemoRoleRouter: React.FC = () => {
  const { role } = useParams();
  const { loginAs } = useDemoAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;

    const validRoles: DemoUserRole[] = ["manager", "staff", "client"];

    if (validRoles.includes(role as DemoUserRole)) {
      loginAs(role as DemoUserRole);

      // Redirect to the correct dashboard
      navigate(`/demo/${role}/dashboard`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [role, loginAs, navigate]);

  return (
    <div className="p-8">
      <p className="wood-text-box">Loading demo…</p>
    </div>
  );
};

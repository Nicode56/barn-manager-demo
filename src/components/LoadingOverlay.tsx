import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const LoadingOverlay: React.FC = () => {
  const active = useSelector((state: RootState) => state.loading.activeRequests);

  if (active === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-xl font-semibold">
        Loading…
      </div>
    </div>
  );
};

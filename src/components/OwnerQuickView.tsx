import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { animals } from "@/demo-data/animals";
import { clients } from "@/demo-data/clients";
import "../styles/OwnerQuickView.css";

interface OwnerQuickViewProps {
  horseId: number;
  role: "client" | "staff" | "manager";
  onClose: () => void;
}

export const OwnerQuickView = ({
  horseId,
  role,
  onClose
}: OwnerQuickViewProps) => {
  const horse = animals.find(a => a.id === horseId);
  const owner = clients.find(c => c.id === horse?.ownerId);

  const startY = useRef<number | null>(null);
  const [dragAmount, setDragAmount] = useState(0);

  if (!horse || !owner) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setDragAmount(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragAmount > 60) {
      onClose();
    }
    setDragAmount(0);
    startY.current = null;
  };

  return ReactDOM.createPortal(
    <div className="emergency-overlay" onClick={onClose}>
      <div
        className="emergency-sheet animate-slide-up"
        style={{ transform: `translateY(${dragAmount}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* CLOSE BUTTON FOR DESKTOP */}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {/* TOP SECTION */}
        <div className="pt-8 px-6">
          <h1 className="text-4xl font-extrabold tracking-wide text-black mb-4">
            {owner.name.toUpperCase()}
          </h1>

          <a
            href={`tel:${owner.phone}`}
            className="block text-2xl font-bold text-black underline mb-6"
          >
            {owner.phone.toUpperCase()}
          </a>
        </div>

        {/* KNOWN ISSUES */}
        <div className="px-10 mt-4 mb-6">
          <h2 className="text-xl font-bold mb-1">Known Issues</h2>
          <p className="text-lg font-semibold mb-4">
            {horse.alerts.knownIssues}
          </p>

          <h2 className="text-xl font-bold mb-1">Do Not Contact Unless</h2>
          <p className="text-lg font-semibold">
            {horse.alerts.contactUnless}
          </p>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="px-6 mt-8 mb-10">
          <h2 className="emergency-header">EMERGENCY CONTACT</h2>

          <a
            href={`tel:${owner.emergency}`}
            className="block text-2xl font-extrabold text-red-600 underline"
          >
            {owner.emergency.toUpperCase()}
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};





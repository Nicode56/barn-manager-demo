import React from "react";

interface NoteCardProps {
  children: React.ReactNode;
}

export const NoteCard: React.FC<NoteCardProps> = ({ children }) => {
  return (
    <div
      className="
        p-3
        bg-yellow-50
        border border-yellow-600
        rounded-md
        shadow-sm
        text-amber-900
      "
    >
      {children}
    </div>
  );
};

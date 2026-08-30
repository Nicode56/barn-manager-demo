import React from "react";

interface NotesFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "Write notes here...",
  rows = 4
}) => {
  return (
    <div className="space-y-2">
      <label className="text-amber-800 font-semibold">{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="
          note-field
          w-full
          p-3
          rounded-md
          border border-amber-300
          bg-amber-50
          text-amber-900
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-amber-700
          focus:border-amber-700
          transition
        "
      />
    </div>
  );
};

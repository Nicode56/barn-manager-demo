import React from "react";

interface RusticInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RusticInput: React.FC<RusticInputProps> = ({
  label,
  value,
  onChange,
  placeholder = ""
}) => {
  return (
    <div className="space-y-2">
      <label className="text-amber-800 font-semibold">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
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

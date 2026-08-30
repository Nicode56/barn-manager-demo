import React, { useState } from "react";
import styled from "@emotion/styled";

interface Props {
  onSave: () => void;
  disabled?: boolean;
}

const Button = styled.button<{ justSaved: boolean }>`
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid ${(p) => (p.justSaved ? "#16a34a" : "#d4d4d4")};
  background: ${(p) => (p.justSaved ? "#f0fdf4" : "white")};
  color: ${(p) => (p.justSaved ? "#15803d" : "#262626")};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: #d97706;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SaveMapButton: React.FC<Props> = ({ onSave, disabled }) => {
  const [justSaved, setJustSaved] = useState(false);

  const handleClick = () => {
    onSave();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1500);
  };

  return (
    <Button onClick={handleClick} disabled={disabled} justSaved={justSaved}>
      {justSaved ? "Saved ✓" : "Save Map"}
    </Button>
  );
};
import React from "react";

interface Props {
  features: string[];
}

export const ComingSoonPage: React.FC<Props> = ({ features }) => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Coming Soon</h1>

      <p className="mb-4">These advanced features are under development:</p>

      <ul className="list-disc pl-6 space-y-2">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
};
import React from "react";
import { FarmLayoutBuilder } from "../components/farmLayout/FarmLayoutBuilder";

const FarmMapPage: React.FC = () => {
  return (
    <main className="w-full h-full overflow-hidden">
      <FarmLayoutBuilder />
    </main>
  );
};

export default FarmMapPage;



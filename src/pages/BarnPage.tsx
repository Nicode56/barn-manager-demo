import React from "react";
import { useAppSelector } from "../store/hooks";
import BarnLayoutBuilder from "../components/barnLayout/BarnLayoutBuilder";


const BarnPage: React.FC = () => {
  const barnId = useAppSelector((state) => state.barnLayout.barnId);
  const stalls = useAppSelector((state) => state.barnLayout.stalls);
  const selectedStallId = useAppSelector((state) => state.barnLayout.selectedStallId);

  return (
    <BarnLayoutBuilder
      barnId={barnId}
      stalls={stalls}
      selectedStallId={selectedStallId}
    />
  );
};

export default BarnPage;








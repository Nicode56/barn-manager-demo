import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FarmShape } from "../../store/farmLayout/farmLayoutTypes";

export const useBarnDrillDown = () => {
  const navigate = useNavigate();

  const farmId = useSelector((state: RootState) => state.farm.farmId);
  const stalls = useSelector((state: RootState) => state.barnLayout.stalls);

  const openBarn = (shape: FarmShape) => {
    if (shape.category !== "Barn") return;

    // Filter stalls for this barn + farm
    const barnStalls = stalls.filter(
      (stall) =>
        stall.barnId === shape.id &&
        stall.farmId === farmId
    );

    //  ALWAYS pass barnId, farmId, and stalls — even if stalls = []
    navigate(`/barns/${shape.id}`, {
      state: {
        barnId: shape.id,
        farmId,
        stalls: barnStalls,
      },
    });
  };

  return { openBarn };
};

